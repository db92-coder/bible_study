import { Router } from 'express';
import { z } from 'zod';
import { findBook } from '../data/books.js';
import { anthropic, STUDY_MODEL } from '../lib/anthropic.js';
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

const PLAN_SYSTEM_PROMPT = `You design Bible reading plans for a study app.

Respond with ONLY JSON — no prose, no code fences, MINIFIED on a single line (no indentation or newlines):
{"title":"...","description":"...","days":[{"day_number":1,"passages":[{"book":"<full book name>","chapter_start":<int>,"chapter_end":<int or omit>}],"reflection_prompt":"<one warm question or thought, under 25 words>"}]}

Rules:
- Honor the user's goal and any stated duration. Maximum 40 days — if the goal implies more, design the best ≤40-day version and say so briefly in the description.
- 1–5 passages per day; keep daily reading loads realistic and even.
- Book names exactly like: Genesis, 1 Samuel, Psalms, Song of Solomon, Matthew, 1 Corinthians, Revelation.
- Reflection prompts: one sentence each, specific to that day's reading, never generic filler.
- Adapt to the reader:
  - New to the Bible: start with readable narrative (a gospel first), explain unfamiliar terms inside the prompts, gentle pace.
  - Some familiarity: balanced pace, prompts that connect passages to the wider story.
  - Very familiar: deeper cuts, cross-testament connections, more demanding prompts.
- If an age group is given, let it shape the prompts naturally (identity and belonging for teens; purpose, work, and relationships for young adults; family and perseverance for mid-life; legacy, hope, and comfort for older readers) — warmly, never patronizingly.
- The description is 1–2 sentences saying what the plan does and who it fits.`;

plansRouter.post('/plans/generate', async (req, res, next) => {
  try {
    const body = z
      .object({
        goal: z.string().max(300).optional(),
        knowledge_level: z.enum(['new', 'some', 'experienced']).optional(),
        age_group: z.string().max(30).optional(),
      })
      .refine((b) => (b.goal ?? '').trim() !== '' || b.knowledge_level, {
        message: 'Provide a goal or a knowledge level',
      })
      .parse(req.body);

    if (!anthropic) {
      res.status(503).json({ error: 'AI features are not configured' });
      return;
    }

    const parts = [
      body.goal?.trim()
        ? `Goal: ${body.goal.trim()}`
        : 'Goal: a starter plan to help me get going with the Bible.',
      body.knowledge_level
        ? `Bible familiarity: ${
            { new: 'new to the Bible', some: 'some familiarity', experienced: 'very familiar' }[
              body.knowledge_level
            ]
          }`
        : null,
      body.age_group ? `Age group: ${body.age_group}` : null,
    ].filter(Boolean);

    const message = await anthropic.messages.create({
      model: STUDY_MODEL,
      max_tokens: 5000,
      system: PLAN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: parts.join('\n') }],
    });
    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const draftSchema = z.object({
      title: z.string().min(1).max(200),
      description: z.string().max(2000).default(''),
      days: z
        .array(
          z.object({
            day_number: z.number().int(),
            passages: z
              .array(
                z.object({
                  book: z.string(),
                  chapter_start: z.number().int().min(1),
                  chapter_end: z.number().int().min(1).optional(),
                }),
              )
              .min(1),
            reflection_prompt: z.string().max(1000).nullable().optional(),
          }),
        )
        .min(1)
        .max(45),
    });
    const draft = draftSchema.parse(JSON.parse(raw));

    // Validate books, clamp chapters, drop broken passages, reindex days.
    const days = draft.days
      .map((d) => ({
        passages: d.passages
          .map((p) => {
            const info = findBook(p.book);
            if (!info) return null;
            const start = Math.min(p.chapter_start, info.chapters);
            const end = p.chapter_end
              ? Math.min(Math.max(p.chapter_end, start), info.chapters)
              : undefined;
            return { book: info.name, chapter_start: start, ...(end && end !== start ? { chapter_end: end } : {}) };
          })
          .filter((p): p is NonNullable<typeof p> => p !== null)
          .slice(0, 5),
        reflection_prompt: d.reflection_prompt ?? null,
      }))
      .filter((d) => d.passages.length > 0)
      .slice(0, 40)
      .map((d, i) => ({ ...d, day_number: i + 1 }));

    if (days.length === 0) {
      res.status(502).json({ error: 'Plan generation produced no usable days — try rephrasing' });
      return;
    }

    res.json({ plan: { title: draft.title, description: draft.description, days } });
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
