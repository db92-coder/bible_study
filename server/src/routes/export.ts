import { ZipArchive } from 'archiver';
import { Router } from 'express';
import { supabase } from '../lib/supabase.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const exportRouter = Router();

interface GraphNodeRow {
  id: string;
  label: string;
  type: string;
  body_md: string;
  verse_ref: string | null;
  color: string | null;
}

interface GraphEdgeRow {
  id: string;
  source_id: string;
  target_id: string;
  label: string | null;
}

interface PlanRow {
  id: string;
  title: string;
  description: string;
}

interface PlanDayRow {
  plan_id: string;
  day_number: number;
  passages: Array<{ book: string; chapter_start: number; chapter_end?: number }>;
  reflection_prompt: string | null;
}

// Obsidian tolerates most characters in filenames but these cause problems
// across platforms (Windows-reserved chars, path separators, wikilink syntax).
const FORBIDDEN_CHARS = /[\\/:*?"<>|#^[\]]/g;

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(FORBIDDEN_CHARS, '-').replace(/\s+/g, ' ').trim();
  return cleaned.length > 0 ? cleaned.slice(0, 180) : 'Untitled';
}

/** Dedupe filenames within a folder by appending " (2)", " (3)", ... */
function uniqueNamer() {
  const seen = new Map<string, number>();
  return (rawName: string) => {
    const base = sanitizeFilename(rawName);
    const key = base.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? base : `${base} (${count + 1})`;
  };
}

function yamlString(value: string): string {
  return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ')}"`;
}

function passageLabel(p: { book: string; chapter_start: number; chapter_end?: number }): string {
  return p.chapter_end && p.chapter_end !== p.chapter_start
    ? `${p.book} ${p.chapter_start}-${p.chapter_end}`
    : `${p.book} ${p.chapter_start}`;
}

exportRouter.get('/export/obsidian', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!supabase) {
      res.status(503).json({ error: 'Database is not configured' });
      return;
    }
    const uid = req.user!.uid;

    const [nodesRes, edgesRes, plansRes] = await Promise.all([
      supabase.from('graph_nodes').select('*').eq('firebase_uid', uid),
      supabase.from('graph_edges').select('*').eq('firebase_uid', uid),
      supabase
        .from('study_plans')
        .select('*')
        .or(`firebase_uid.eq.${uid},is_public.eq.true`),
    ]);
    if (nodesRes.error) throw nodesRes.error;
    if (edgesRes.error) throw edgesRes.error;
    if (plansRes.error) throw plansRes.error;

    const nodes = (nodesRes.data ?? []) as GraphNodeRow[];
    const edges = (edgesRes.data ?? []) as GraphEdgeRow[];
    const plans = (plansRes.data ?? []) as PlanRow[];

    let planDays: PlanDayRow[] = [];
    if (plans.length > 0) {
      const daysRes = await supabase
        .from('plan_days')
        .select('*')
        .in(
          'plan_id',
          plans.map((p) => p.id),
        );
      if (daysRes.error) throw daysRes.error;
      planDays = (daysRes.data ?? []) as PlanDayRow[];
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="scribe-obsidian-export.zip"');

    const archive = new ZipArchive({ zlib: { level: 9 } });
    archive.on('error', (err: Error) => {
      console.error('[scribe] export archive error:', err);
      if (!res.headersSent) res.status(500);
      res.end();
    });
    archive.pipe(res);

    // ── Graph nodes → one note per node, wikilinked to their connections ──
    const nodeFilename = uniqueNamer();
    const filenameById = new Map<string, string>();
    for (const n of nodes) filenameById.set(n.id, nodeFilename(n.label));

    const edgesByNode = new Map<string, Array<{ otherId: string; label: string | null }>>();
    for (const e of edges) {
      if (!filenameById.has(e.source_id) || !filenameById.has(e.target_id)) continue;
      if (!edgesByNode.has(e.source_id)) edgesByNode.set(e.source_id, []);
      if (!edgesByNode.has(e.target_id)) edgesByNode.set(e.target_id, []);
      edgesByNode.get(e.source_id)!.push({ otherId: e.target_id, label: e.label });
      edgesByNode.get(e.target_id)!.push({ otherId: e.source_id, label: e.label });
    }

    for (const n of nodes) {
      const frontmatter = [
        '---',
        `scribe_type: ${n.type}`,
        `scribe_id: ${n.id}`,
        n.verse_ref ? `verse_ref: ${yamlString(n.verse_ref)}` : null,
        n.color ? `color: ${yamlString(n.color)}` : null,
        `tags: [scribe/${n.type}]`,
        '---',
        '',
      ]
        .filter((l) => l !== null)
        .join('\n');

      const links = edgesByNode.get(n.id) ?? [];
      const linksSection =
        links.length > 0
          ? [
              '',
              '',
              '## Connections',
              ...links.map((l) => {
                const name = filenameById.get(l.otherId);
                return l.label ? `- [[${name}]] — ${l.label}` : `- [[${name}]]`;
              }),
            ].join('\n')
          : '';

      const body = `${frontmatter}# ${n.label}\n\n${n.body_md.trim()}${linksSection}\n`;
      archive.append(body, { name: `Scribe Export/Graph/${filenameById.get(n.id)}.md` });
    }

    // ── Study plans → a folder per plan, overview + one note per day ──
    const planFolderNamer = uniqueNamer();
    for (const plan of plans) {
      const folder = planFolderNamer(plan.title);
      const days = planDays
        .filter((d) => d.plan_id === plan.id)
        .sort((a, b) => a.day_number - b.day_number);
      const dayNamer = uniqueNamer();
      const dayFilenames = days.map((d) => dayNamer(`Day ${String(d.day_number).padStart(2, '0')}`));

      const overview = [
        '---',
        'tags: [scribe/plan]',
        `scribe_id: ${plan.id}`,
        '---',
        '',
        `# ${plan.title}`,
        '',
        plan.description.trim(),
        '',
        '## Days',
        ...dayFilenames.map((name) => `- [[${name}]]`),
        '',
      ].join('\n');
      archive.append(overview, { name: `Scribe Export/Plans/${folder}/Overview.md` });

      days.forEach((d, i) => {
        const note = [
          '---',
          'tags: [scribe/plan-day]',
          `day: ${d.day_number}`,
          '---',
          '',
          `# Day ${d.day_number} — ${plan.title}`,
          '',
          `**Passages:** ${d.passages.map(passageLabel).join('; ')}`,
          '',
          d.reflection_prompt ? d.reflection_prompt.trim() : '',
          '',
          `[[Overview]]`,
          '',
        ].join('\n');
        archive.append(note, { name: `Scribe Export/Plans/${folder}/${dayFilenames[i]}.md` });
      });
    }

    const readme = [
      '# Scribe export',
      '',
      `Exported ${new Date().toISOString().slice(0, 10)} — ${nodes.length} graph node(s), ${plans.length} plan(s).`,
      '',
      'Drop the "Scribe Export" folder into your Obsidian vault. Graph nodes link to each',
      'other with [[wikilinks]], so they will appear connected in Obsidian\'s own graph view.',
      'This is a snapshot, not a live sync — re-export from Scribe any time to refresh it',
      '(files with the same names will be overwritten; renamed or deleted Scribe items will',
      'not automatically remove their old notes).',
    ].join('\n');
    archive.append(readme, { name: 'Scribe Export/README.md' });

    await archive.finalize();
  } catch (err) {
    next(err);
  }
});
