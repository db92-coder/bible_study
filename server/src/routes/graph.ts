import { Router } from 'express';
import { z } from 'zod';
import { anthropic, STUDY_MODEL } from '../lib/anthropic.js';
import { supabase } from '../lib/supabase.js';
import { ensureProfile } from '../middleware/ensureProfile.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const graphRouter = Router();

const nodeBody = z.object({
  label: z.string().min(1).max(200),
  type: z.enum(['theme', 'person', 'place', 'verse', 'idea']).default('idea'),
  body_md: z.string().max(50_000).default(''),
  verse_ref: z.string().max(60).nullable().optional(),
  color: z.string().max(20).nullable().optional(),
});

const edgeBody = z.object({
  source_id: z.string().uuid(),
  target_id: z.string().uuid(),
  label: z.string().max(100).nullable().optional(),
});

graphRouter.use(
  '/graph',
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

graphRouter.get('/graph', async (req, res, next) => {
  try {
    const uid = req.user!.uid;
    const [nodes, edges] = await Promise.all([
      supabase!.from('graph_nodes').select('*').eq('firebase_uid', uid),
      supabase!.from('graph_edges').select('*').eq('firebase_uid', uid),
    ]);
    if (nodes.error) throw nodes.error;
    if (edges.error) throw edges.error;
    res.json({ nodes: nodes.data, edges: edges.data });
  } catch (err) {
    next(err);
  }
});

graphRouter.post('/graph/nodes', async (req, res, next) => {
  try {
    const body = nodeBody.parse(req.body);
    const { data, error } = await supabase!
      .from('graph_nodes')
      .insert({ ...body, firebase_uid: req.user!.uid })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ node: data });
  } catch (err) {
    next(err);
  }
});

graphRouter.put('/graph/nodes/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const body = nodeBody.parse(req.body);
    const { data, error } = await supabase!
      .from('graph_nodes')
      .update(body)
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Node not found' });
      return;
    }
    res.json({ node: data });
  } catch (err) {
    next(err);
  }
});

graphRouter.delete('/graph/nodes/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { error, count } = await supabase!
      .from('graph_nodes')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid);
    if (error) throw error;
    if (!count) {
      res.status(404).json({ error: 'Node not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

const AUTOLINK_SYSTEM_PROMPT = `You judge which of a user's Bible-study themes each verse genuinely relates to.

Only affirm strong, natural associations that a thoughtful reader would draw from the verse itself — not loose or clever stretches. A verse about dietary laws relates to "food" and "obedience"; it does not relate to "courage".

Reply with ONLY a JSON array, no prose, no code fences:
[{"ref": "<verse ref exactly as given>", "themes": ["<matching theme exactly as given>", ...]}]
Use empty arrays for verses that match nothing. Use the theme strings exactly as provided.`;

// Given verse refs and the user's theme labels, return which themes each
// verse genuinely relates to — used to auto-link new verse nodes.
graphRouter.post('/graph/autolink', async (req, res, next) => {
  try {
    const body = z
      .object({
        verses: z
          .array(z.object({ ref: z.string().min(3).max(40), text: z.string().max(400).optional() }))
          .min(1)
          .max(25),
        themes: z.array(z.string().min(1).max(100)).min(1).max(40),
      })
      .parse(req.body);

    if (!anthropic) {
      res.status(503).json({ error: 'AI features are not configured' });
      return;
    }

    const message = await anthropic.messages.create({
      model: STUDY_MODEL,
      max_tokens: 1200,
      system: AUTOLINK_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: JSON.stringify({ themes: body.themes, verses: body.verses }),
        },
      ],
    });
    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const parsed = z
      .array(z.object({ ref: z.string(), themes: z.array(z.string()) }))
      .parse(JSON.parse(raw));

    // Only echo back refs and themes we were actually given.
    const validRefs = new Set(body.verses.map((v) => v.ref));
    const validThemes = new Set(body.themes);
    const matches = parsed
      .filter((m) => validRefs.has(m.ref))
      .map((m) => ({ ref: m.ref, themes: m.themes.filter((t) => validThemes.has(t)) }))
      .filter((m) => m.themes.length > 0);

    res.json({ matches });
  } catch (err) {
    next(err);
  }
});

graphRouter.post('/graph/edges', async (req, res, next) => {
  try {
    const body = edgeBody.parse(req.body);
    if (body.source_id === body.target_id) {
      res.status(400).json({ error: 'Cannot link a node to itself' });
      return;
    }
    const uid = req.user!.uid;

    // Both endpoints must belong to the user.
    const owned = await supabase!
      .from('graph_nodes')
      .select('id')
      .eq('firebase_uid', uid)
      .in('id', [body.source_id, body.target_id]);
    if (owned.error) throw owned.error;
    if ((owned.data ?? []).length !== 2) {
      res.status(400).json({ error: 'Both nodes must exist and belong to you' });
      return;
    }

    const { data, error } = await supabase!
      .from('graph_edges')
      .insert({ ...body, firebase_uid: uid })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ edge: data });
  } catch (err) {
    next(err);
  }
});

graphRouter.put('/graph/edges/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { label } = z.object({ label: z.string().max(100).nullable() }).parse(req.body);
    const { data, error } = await supabase!
      .from('graph_edges')
      .update({ label })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid)
      .select()
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Edge not found' });
      return;
    }
    res.json({ edge: data });
  } catch (err) {
    next(err);
  }
});

graphRouter.delete('/graph/edges/:id', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const { error, count } = await supabase!
      .from('graph_edges')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('firebase_uid', req.user!.uid);
    if (error) throw error;
    if (!count) {
      res.status(404).json({ error: 'Edge not found' });
      return;
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
