import { Router, type Response } from 'express';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { findBook } from '../data/books.js';
import { supabase } from '../lib/supabase.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

interface RefPoint {
  book: string;
  chapter: number;
}

export interface Connection {
  id: string;
  kind: 'prophecy' | 'connection' | 'user';
  group: string;
  category: string;
  title: string;
  description: string;
  significance: string | null;
  source_text: string | null;
  ot: { label: string; refs: RefPoint[] };
  nt: { label: string; refs: RefPoint[] };
}

// 61 seeded connections: 30 prophecies + 31 types/covenants/themes,
// imported from the bible-prophecy-study project.
const SEEDED: Connection[] = JSON.parse(
  readFileSync(new URL('../data/connections.json', import.meta.url), 'utf-8'),
);

export const connectionsRouter = Router();

connectionsRouter.get('/connections', (_req, res) => {
  res.json({ connections: SEEDED });
});

const refSchema = z.object({
  book: z.string().min(2).max(30),
  chapter: z.number().int().min(1),
});

const userConnBody = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(40).default('Personal'),
  description: z.string().max(4000).default(''),
  ot: refSchema,
  nt: refSchema,
});

function requireDb(res: Response): boolean {
  if (!supabase) {
    res.status(503).json({ error: 'Database is not configured' });
    return false;
  }
  return true;
}

interface UserConnRow {
  id: string;
  title: string;
  category: string;
  description: string;
  ot_book: string;
  ot_chapter: number;
  ot_label: string;
  nt_book: string;
  nt_chapter: number;
  nt_label: string;
}

function rowToConnection(row: UserConnRow): Connection {
  return {
    id: `u-${row.id}`,
    kind: 'user',
    group: 'Personal',
    category: row.category,
    title: row.title,
    description: row.description,
    significance: null,
    source_text: null,
    ot: { label: row.ot_label, refs: [{ book: row.ot_book, chapter: row.ot_chapter }] },
    nt: { label: row.nt_label, refs: [{ book: row.nt_book, chapter: row.nt_chapter }] },
  };
}

connectionsRouter.get('/connections/mine', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const { data, error } = await supabase!
      .from('user_connections')
      .select('*')
      .eq('firebase_uid', req.user!.uid)
      .order('created_at', { ascending: true });
    if (error) {
      // Table missing (migration 002 not applied yet) → degrade to empty.
      console.warn('[scribe] user_connections read failed:', error.message);
      res.json({ connections: [], unavailable: true });
      return;
    }
    res.json({ connections: (data as UserConnRow[]).map(rowToConnection) });
  } catch (err) {
    next(err);
  }
});

connectionsRouter.post('/connections/mine', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const body = userConnBody.parse(req.body);
    for (const ref of [body.ot, body.nt]) {
      const info = findBook(ref.book);
      if (!info || ref.chapter > info.chapters) {
        res.status(400).json({ error: `Invalid reference: ${ref.book} ${ref.chapter}` });
        return;
      }
    }
    const { data, error } = await supabase!
      .from('user_connections')
      .insert({
        firebase_uid: req.user!.uid,
        title: body.title,
        category: body.category,
        description: body.description,
        ot_book: findBook(body.ot.book)!.name,
        ot_chapter: body.ot.chapter,
        ot_label: `${findBook(body.ot.book)!.name} ${body.ot.chapter}`,
        nt_book: findBook(body.nt.book)!.name,
        nt_chapter: body.nt.chapter,
        nt_label: `${findBook(body.nt.book)!.name} ${body.nt.chapter}`,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ connection: rowToConnection(data as UserConnRow) });
  } catch (err) {
    next(err);
  }
});

connectionsRouter.delete('/connections/mine/:id', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!requireDb(res)) return;
    const id = z.string().uuid().parse(req.params.id);
    const { error, count } = await supabase!
      .from('user_connections')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid);
    if (error) throw error;
    if (!count) {
      res.status(404).json({ error: 'Connection not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
