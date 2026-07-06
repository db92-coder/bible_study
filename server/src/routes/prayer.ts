import { Router } from 'express';
import { z } from 'zod';
import { PATTERNS_BY_SLUG, PRAYER_PATTERNS } from '../data/prayerPatterns.js';
import { supabase } from '../lib/supabase.js';
import { ensureProfile } from '../middleware/ensureProfile.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const prayerRouter = Router();

// Patterns are static curated content — no auth needed, same as /api/learn.
prayerRouter.get('/prayer/patterns', (_req, res) => {
  res.json({
    patterns: PRAYER_PATTERNS.map(({ slug, title, summary }) => ({ slug, title, summary })),
  });
});

prayerRouter.get('/prayer/patterns/:slug', (req, res) => {
  const pattern = PATTERNS_BY_SLUG.get(String(req.params.slug ?? ''));
  if (!pattern) {
    res.status(404).json({ error: 'Pattern not found' });
    return;
  }
  res.json({ pattern });
});

const requestBody = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(['person', 'situation', 'world', 'thanksgiving', 'other']).default('other'),
  body_md: z.string().max(4000).default(''),
});

const updateBody = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(['person', 'situation', 'world', 'thanksgiving', 'other']).optional(),
  body_md: z.string().max(4000).optional(),
  status: z.enum(['active', 'answered']).optional(),
  answered_note: z.string().max(2000).nullable().optional(),
});

const listQuery = z.object({
  status: z.enum(['active', 'answered']).optional(),
});

prayerRouter.use(
  '/prayer/requests',
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

prayerRouter.get('/prayer/requests', async (req, res, next) => {
  try {
    const { status } = listQuery.parse(req.query);
    let query = supabase!
      .from('prayer_requests')
      .select('*')
      .eq('firebase_uid', req.user!.uid)
      .order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ requests: data });
  } catch (err) {
    next(err);
  }
});

prayerRouter.post('/prayer/requests', async (req, res, next) => {
  try {
    const body = requestBody.parse(req.body);
    const { data, error } = await supabase!
      .from('prayer_requests')
      .insert({ ...body, firebase_uid: req.user!.uid })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ request: data });
  } catch (err) {
    next(err);
  }
});

prayerRouter.patch('/prayer/requests/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = updateBody.parse(req.body);

    const patch: Record<string, unknown> = { ...body };
    if (body.status === 'answered') {
      patch.answered_at = new Date().toISOString();
    } else if (body.status === 'active') {
      patch.answered_at = null;
      patch.answered_note = null;
    }

    const { data, error } = await supabase!
      .from('prayer_requests')
      .update(patch)
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Prayer request not found' });
      return;
    }
    res.json({ request: data });
  } catch (err) {
    next(err);
  }
});

prayerRouter.delete('/prayer/requests/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { error, count } = await supabase!
      .from('prayer_requests')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid);
    if (error) throw error;
    if (!count) {
      res.status(404).json({ error: 'Prayer request not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
