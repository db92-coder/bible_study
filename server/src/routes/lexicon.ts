import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { FEATURED_WORDS } from '../data/featuredWords.js';

export interface LexiconEntry {
  lemma: string | null;
  translit: string | null;
  pron: string | null;
  derivation: string | null;
  strongs_def: string | null;
  kjv_def: string | null;
}

// Strong's Hebrew (8,674) + Greek (5,523) dictionaries, public domain,
// JSON edition by Open Scriptures (CC-BY-SA).
const LEXICON: Record<string, LexiconEntry> = JSON.parse(
  readFileSync(new URL('../data/lexicon.json', import.meta.url), 'utf-8'),
);

function withId(id: string) {
  const entry = LEXICON[id];
  if (!entry) return null;
  return { id, language: id.startsWith('H') ? 'Hebrew' : 'Greek', ...entry };
}

function normalizeId(raw: string): string | null {
  const m = raw.trim().toUpperCase().match(/^([HG])\s*0*(\d{1,4})$/);
  return m ? `${m[1]}${m[2]}` : null;
}

export const lexiconRouter = Router();

lexiconRouter.get('/lexicon/featured', (_req, res) => {
  const words = FEATURED_WORDS.map((f) => {
    const entry = withId(f.id);
    return entry ? { ...entry, note: f.note } : null;
  }).filter(Boolean);
  res.json({ words });
});

lexiconRouter.get('/lexicon/search', (req, res, next) => {
  try {
    const q = z.string().min(1).max(60).parse(req.query.q).trim();

    // Direct Strong's number (e.g. "H2617", "g26")
    const direct = normalizeId(q);
    if (direct) {
      const entry = withId(direct);
      res.json({ results: entry ? [entry] : [] });
      return;
    }

    // Strong's transliteration uses ç for s-sounds and writes long vowels with
    // glides (shâlôwm), so normalize hard before comparing: strip diacritics,
    // then reduce to a consonant skeleton (drop vowels/glides) as a fallback.
    const clean = (s: string) =>
      s
        .toLowerCase()
        .replace(/ç/g, 's')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z]/g, '');
    const skeleton = (s: string) => clean(s).replace(/[aeiouwy]/g, '');

    const needle = q.toLowerCase();
    const cleanNeedle = clean(q);
    const skelNeedle = skeleton(q);
    const results: NonNullable<ReturnType<typeof withId>>[] = [];
    const add = (id: string) => {
      if (results.length < 20 && !results.some((r) => r.id === id)) results.push(withId(id)!);
    };

    // Pass 1: transliteration containment; pass 2: consonant-skeleton match;
    // pass 3: English definition containment.
    for (const pass of [1, 2, 3] as const) {
      for (const id of Object.keys(LEXICON)) {
        if (results.length >= 20) break;
        const e = LEXICON[id];
        let hit = false;
        if (pass === 1) {
          hit = e.lemma === q || (cleanNeedle.length >= 3 && clean(e.translit ?? '').includes(cleanNeedle));
        } else if (pass === 2) {
          hit = skelNeedle.length >= 2 && skeleton(e.translit ?? '') === skelNeedle;
        } else {
          hit =
            (e.strongs_def?.toLowerCase().includes(needle) ?? false) ||
            (e.kjv_def?.toLowerCase().includes(needle) ?? false);
        }
        if (hit) add(id);
      }
      if (results.length >= 20) break;
    }
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

lexiconRouter.get('/lexicon/:strongs', (req, res) => {
  const id = normalizeId(String(req.params.strongs ?? ''));
  if (!id) {
    res.status(400).json({ error: "Strong's number must look like H2617 or G26" });
    return;
  }
  const entry = withId(id);
  if (!entry) {
    res.status(404).json({ error: `No entry for ${id}` });
    return;
  }
  res.json({ entry });
});
