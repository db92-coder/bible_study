import { Router, type Response } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';

export const genealogyRouter = Router();

interface PersonRow {
  id: string;
  name: string;
  primary_ref: string;
}

interface Rel {
  parent_id: string;
  child_id: string;
  relationship: string;
  source_ref: string;
}

interface PersonSummary {
  id: string;
  name: string;
  source_ref: string;
}

function requireDb(res: Response): boolean {
  if (!supabase) {
    res.status(503).json({ error: 'Database is not configured' });
    return false;
  }
  return true;
}

async function parentsOf(childIds: string[]): Promise<Rel[]> {
  if (childIds.length === 0) return [];
  const { data, error } = await supabase!
    .from('genealogy_relationships')
    .select('parent_id, child_id, relationship, source_ref')
    .in('child_id', childIds);
  if (error) throw error;
  return data ?? [];
}

async function childrenOf(parentIds: string[]): Promise<Rel[]> {
  if (parentIds.length === 0) return [];
  const { data, error } = await supabase!
    .from('genealogy_relationships')
    .select('parent_id, child_id, relationship, source_ref')
    .in('parent_id', parentIds);
  if (error) throw error;
  return data ?? [];
}

async function peopleByIds(ids: string[]): Promise<Map<string, PersonRow>> {
  if (ids.length === 0) return new Map();
  const { data, error } = await supabase!
    .from('genealogy_people')
    .select('id, name, primary_ref')
    .in('id', ids);
  if (error) throw error;
  return new Map((data ?? []).map((p) => [p.id, p]));
}

function toSummaries(
  rels: Rel[],
  idKey: 'parent_id' | 'child_id',
  people: Map<string, PersonRow>,
): PersonSummary[] {
  return rels
    .map((r) => {
      const p = people.get(r[idKey]);
      return p ? { id: p.id, name: p.name, source_ref: r.source_ref } : null;
    })
    .filter((p): p is PersonSummary => p !== null);
}

genealogyRouter.get('/genealogy/names', async (_req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const { data, error } = await supabase!.from('genealogy_people').select('id, name');
    if (error) throw error;
    res.json({ people: data ?? [] });
  } catch (err) {
    next(err);
  }
});

genealogyRouter.get('/genealogy/search', async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const q = z.string().min(1).max(60).parse(req.query.q).trim();
    const { data, error } = await supabase!
      .from('genealogy_people')
      .select('id, name, primary_ref')
      .ilike('name', `%${q}%`)
      .order('name')
      .limit(20);
    if (error) throw error;
    res.json({ results: data ?? [] });
  } catch (err) {
    next(err);
  }
});

genealogyRouter.get('/genealogy/person/:id', async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const id = z.string().uuid().parse(req.params.id);

    const person = await supabase!
      .from('genealogy_people')
      .select('id, name, primary_ref')
      .eq('id', id)
      .maybeSingle();
    if (person.error) throw person.error;
    if (!person.data) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    const parentRels = await parentsOf([id]);
    const parentIds = [...new Set(parentRels.map((r) => r.parent_id))];
    const grandparentRels = await parentsOf(parentIds);
    const grandparentIds = [...new Set(grandparentRels.map((r) => r.parent_id))];

    const childRels = await childrenOf([id]);
    const childIds = [...new Set(childRels.map((r) => r.child_id))];
    const grandchildRels = await childrenOf(childIds);
    const grandchildIds = [...new Set(grandchildRels.map((r) => r.child_id))];

    const people = await peopleByIds([...parentIds, ...grandparentIds, ...childIds, ...grandchildIds]);

    res.json({
      person: { id: person.data.id, name: person.data.name, source_ref: person.data.primary_ref },
      parents: toSummaries(parentRels, 'parent_id', people),
      grandparents: toSummaries(grandparentRels, 'parent_id', people),
      children: toSummaries(childRels, 'child_id', people),
      grandchildren: toSummaries(grandchildRels, 'child_id', people),
    });
  } catch (err) {
    next(err);
  }
});

genealogyRouter.get('/genealogy/tree/:id', async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const id = z.string().uuid().parse(req.params.id);
    const MAX_DEPTH = 6;

    const visited = new Set<string>([id]);
    const edges: Array<{ source: string; target: string; relationship: string }> = [];
    let frontier = [id];

    for (let depth = 0; depth < MAX_DEPTH && frontier.length > 0; depth++) {
      const [up, down] = await Promise.all([parentsOf(frontier), childrenOf(frontier)]);
      const nextFrontier: string[] = [];
      for (const r of [...up, ...down]) {
        edges.push({ source: r.parent_id, target: r.child_id, relationship: r.relationship });
        for (const otherId of [r.parent_id, r.child_id]) {
          if (!visited.has(otherId)) {
            visited.add(otherId);
            nextFrontier.push(otherId);
          }
        }
      }
      frontier = nextFrontier;
    }

    const uniqueEdges = [...new Map(edges.map((e) => [`${e.source}:${e.target}`, e])).values()];
    const people = await peopleByIds([...visited]);
    const nodes = [...visited]
      .map((pid) => {
        const p = people.get(pid);
        return p ? { id: p.id, name: p.name } : null;
      })
      .filter((n): n is { id: string; name: string } => n !== null);

    res.json({ nodes, edges: uniqueEdges });
  } catch (err) {
    next(err);
  }
});
