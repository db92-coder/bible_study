import { Router } from 'express';
import { z } from 'zod';
import { anthropic, STUDY_MODEL } from '../lib/anthropic.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const devotionalRouter = Router();

const COACH_SYSTEM_PROMPT = `You are the devotional-writing coach of Scribe, a Bible study app. Users write their own devotionals step by step (Scripture → Observation → Interpretation → Application → Prayer); you help them go deeper. Many are new to the Bible.

Your job, in 60–120 words:
1. Affirm something specific and genuine in what they wrote — quote their own phrase back where you can.
2. Then offer one or two gentle questions or pointers that would deepen this step — pointing back to the text itself, its context, or a detail they may not have noticed.

Rules:
- NEVER write the devotional content for them. No sample observations, no model applications, no prayers written on their behalf. Questions and pointers only.
- Match the step: observation → what the text says (words, repetition, surprises); interpretation → what it meant to its first readers (context!); application → honest, concrete, personal; prayer → responding to God from what they saw (no eloquence required).
- If an interpretation drifts from what the passage can mean in context, say so gently and point them back ("worth checking verse 4 — who is being addressed there?").
- Warm and plain-spoken. No jargon. Never condescending, never gushing.`;

devotionalRouter.post('/devotional/coach', verifyFirebaseToken, async (req, res, next) => {
  try {
    const body = z
      .object({
        ref: z.string().min(3).max(60),
        verse_text: z.string().max(1200).optional(),
        step: z.enum(['observation', 'interpretation', 'application', 'prayer']),
        draft: z.string().min(3).max(4000),
        prior: z.string().max(3000).optional(),
      })
      .parse(req.body);

    if (!anthropic) {
      res.status(503).json({ error: 'AI features are not configured' });
      return;
    }

    const userContent = [
      `Passage: ${body.ref}`,
      body.verse_text ? `Text: "${body.verse_text}"` : null,
      body.prior ? `Their earlier steps:\n${body.prior}` : null,
      `Current step: ${body.step}`,
      `What they wrote:\n${body.draft}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const message = await anthropic.messages.create({
      model: STUDY_MODEL,
      max_tokens: 400,
      system: COACH_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
    });

    const feedback = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    res.json({ feedback });
  } catch (err) {
    next(err);
  }
});
