import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../lib/supabase.js';
import { ensureProfile } from '../middleware/ensureProfile.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const plansRouter = Router();

export const SYSTEM_UID = '__scribe_system__';

const passageSchema = z.object({
  book: z.string().min(2).max(30),
  chapter_start: z.number().int().min(1),
  chapter_end: z.number().int().min(1).optional(),
});

const daySchema = z.object({
  day_number: z.number().int().min(1),
  passages: z.array(passageSchema).min(1).max(10),
  reflection_prompt: z.string().max(1000).nullable().optional(),
});

const planBody = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  days: z.array(daySchema).min(1).max(400),
});

plansRouter.use(
  '/plans',
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

// Mine + public starter plans, with day counts and my completion counts.
plansRouter.get('/plans', async (req, res, next) => {
  try {
    const uid = req.user!.uid;
    const { data: plans, error } = await supabase!
      .from('study_plans')
      .select('*, plan_days(count)')
      .or(`firebase_uid.eq.${uid},is_public.eq.true`)
      .order('created_at', { ascending: true });
    if (error) throw error;

    const { data: progress, error: pErr } = await supabase!
      .from('plan_progress')
      .select('plan_id, day_number, completed_at')
      .eq('firebase_uid', uid);
    if (pErr) throw pErr;

    const byPlan = new Map<string, number>();
    for (const row of progress ?? []) {
      byPlan.set(row.plan_id, (byPlan.get(row.plan_id) ?? 0) + 1);
    }

    res.json({
      plans: (plans ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        is_public: p.is_public,
        is_mine: p.firebase_uid === uid,
        day_count: p.plan_days?.[0]?.count ?? 0,
        completed_count: byPlan.get(p.id) ?? 0,
      })),
      progress: progress ?? [],
    });
  } catch (err) {
    next(err);
  }
});

plansRouter.get('/plans/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const uid = req.user!.uid;
    const { data: plan, error } = await supabase!
      .from('study_plans')
      .select('*, plan_days(*)')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!plan || (!plan.is_public && plan.firebase_uid !== uid)) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    const { data: progress, error: pErr } = await supabase!
      .from('plan_progress')
      .select('day_number, completed_at')
      .eq('firebase_uid', uid)
      .eq('plan_id', id);
    if (pErr) throw pErr;

    plan.plan_days.sort((a: { day_number: number }, b: { day_number: number }) => a.day_number - b.day_number);
    res.json({
      plan: { ...plan, is_mine: plan.firebase_uid === uid, plan_days: plan.plan_days },
      progress: progress ?? [],
    });
  } catch (err) {
    next(err);
  }
});

plansRouter.post('/plans', async (req, res, next) => {
  try {
    const { title, description, days } = planBody.parse(req.body);
    const uid = req.user!.uid;
    const { data: plan, error } = await supabase!
      .from('study_plans')
      .insert({ firebase_uid: uid, title, description, is_public: false })
      .select()
      .single();
    if (error) throw error;

    const { error: dErr } = await supabase!
      .from('plan_days')
      .insert(days.map((d) => ({ ...d, plan_id: plan.id })));
    if (dErr) throw dErr;

    res.status(201).json({ plan });
  } catch (err) {
    next(err);
  }
});

plansRouter.put('/plans/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { title, description, days } = planBody.parse(req.body);
    const uid = req.user!.uid;

    const { data: plan, error } = await supabase!
      .from('study_plans')
      .update({ title, description })
      .eq('id', id)
      .eq('firebase_uid', uid)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!plan) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }

    // Replace the day list wholesale — simplest correct behavior for edits.
    const del = await supabase!.from('plan_days').delete().eq('plan_id', id);
    if (del.error) throw del.error;
    const ins = await supabase!
      .from('plan_days')
      .insert(days.map((d) => ({ ...d, plan_id: id })));
    if (ins.error) throw ins.error;

    res.json({ plan });
  } catch (err) {
    next(err);
  }
});

plansRouter.delete('/plans/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { error, count } = await supabase!
      .from('study_plans')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid);
    if (error) throw error;
    if (!count) {
      res.status(404).json({ error: 'Plan not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

plansRouter.post('/plans/:id/progress', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { day_number, completed } = z
      .object({ day_number: z.number().int().min(1), completed: z.boolean() })
      .parse(req.body);
    const uid = req.user!.uid;

    if (completed) {
      const { error } = await supabase!
        .from('plan_progress')
        .upsert({ firebase_uid: uid, plan_id: id, day_number });
      if (error) throw error;
    } else {
      const { error } = await supabase!
        .from('plan_progress')
        .delete()
        .eq('firebase_uid', uid)
        .eq('plan_id', id)
        .eq('day_number', day_number);
      if (error) throw error;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});
