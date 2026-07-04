import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { ensureProfile } from '../middleware/ensureProfile.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const notesRouter = Router();

const noteBody = z.object({
  title: z.string().max(200).default(''),
  body_md: z.string().max(100_000).default(''),
  book: z.string().min(2).max(30).nullable().optional(),
  chapter: z.number().int().min(1).nullable().optional(),
  verse_start: z.number().int().min(1).nullable().optional(),
  verse_end: z.number().int().min(1).nullable().optional(),
  tags: z.array(z.string().max(40)).max(20).default([]),
});

const listQuery = z.object({
  book: z.string().min(2).max(30).optional(),
  chapter: z.coerce.number().int().min(1).optional(),
});

notesRouter.use(
  '/notes',
  verifyFirebaseToken,
  (_req, res, next) => {
    if (!supabase) {
      res.status(503).json({ error: 'Database is not configured' });
      return;
    }
    next();
  },
  ensureProfile,
);

notesRouter.get('/notes', async (req, res, next) => {
  try {
    const { book, chapter } = listQuery.parse(req.query);
    let query = supabase!
      .from('notes')
      .select('*')
      .eq('firebase_uid', req.user!.uid)
      .order('updated_at', { ascending: false });
    if (book) query = query.eq('book', book);
    if (chapter) query = query.eq('chapter', chapter);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ notes: data });
  } catch (err) {
    next(err);
  }
});

notesRouter.post('/notes', async (req, res, next) => {
  try {
    const body = noteBody.parse(req.body);
    const { data, error } = await supabase!
      .from('notes')
      .insert({ ...body, firebase_uid: req.user!.uid })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ note: data });
  } catch (err) {
    next(err);
  }
});

notesRouter.put('/notes/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = noteBody.parse(req.body);
    const { data, error } = await supabase!
      .from('notes')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.json({ note: data });
  } catch (err) {
    next(err);
  }
});

notesRouter.delete('/notes/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { error, count } = await supabase!
      .from('notes')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid);
    if (error) throw error;
    if (!count) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
