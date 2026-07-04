import { Router } from 'express';
import { z } from 'zod';
import { anthropic, STUDY_MODEL } from '../lib/anthropic.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const chatRouter = Router();

const CHAT_SYSTEM_PROMPT = `You are the study companion of Scribe, a Bible study app. Many of your readers are new to the Bible; some are experienced. You help them understand Scripture — its text, context, culture, and language.

Sources and grounding:
- Answer only from the biblical text itself, public-domain commentaries (Matthew Henry, Jamieson-Fausset-Brown, Barnes' Notes), and mainstream biblical scholarship of the kind found in standard study Bibles and reference works.
- Always cite book, chapter, and verse for scriptural claims (e.g. John 3:16). When you draw on a commentary, name it ("Matthew Henry notes that…").
- If you are not confident something is well-grounded, say so plainly rather than inventing a source.

Neutrality:
- Where Christian traditions interpret a passage differently (baptism, end times, predestination and free will, spiritual gifts, church governance…), present the main views fairly and say "interpretations differ." Do not pick a side on contested doctrine.
- Distinguish clearly between what the text says, what most scholars agree on, and where readings diverge.

Manner:
- Warm, clear, and plain-spoken. Define any technical or theological term the moment you use it.
- Be concise: most answers should be a few short paragraphs. Use headings or bullets only when they genuinely help.
- You may encourage prayerful reading, but never pressure, and respect that users come from many backgrounds.
- If asked for personal counsel beyond Bible study (medical, legal, crisis), gently point the user to appropriate human help.

The user's current reading position is provided with each message — use it when they say "this passage," "here," or "this verse."`;

const chatBody = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(30),
  context: z
    .object({
      book: z.string().max(30),
      chapter: z.number().int().min(1),
      verse_start: z.number().int().min(1).nullable().optional(),
      verse_end: z.number().int().min(1).nullable().optional(),
    })
    .optional(),
});

chatRouter.post('/chat', verifyFirebaseToken, async (req, res, next) => {
  try {
    if (!anthropic) {
      res.status(503).json({ error: 'AI features are not configured' });
      return;
    }
    const { messages, context } = chatBody.parse(req.body);

    // Inject the reading position ahead of the newest user message.
    const apiMessages = messages.map((m, i) => {
      if (i === messages.length - 1 && m.role === 'user' && context) {
        const sel = context.verse_start
          ? `, verses ${context.verse_start}${context.verse_end && context.verse_end !== context.verse_start ? `–${context.verse_end}` : ''} selected`
          : '';
        return {
          role: m.role,
          content: `[Currently reading: ${context.book} ${context.chapter}${sel}]\n\n${m.content}`,
        };
      }
      return m;
    });

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = anthropic.messages.stream({
      model: STUDY_MODEL,
      max_tokens: 1500,
      system: CHAT_SYSTEM_PROMPT,
      messages: apiMessages,
    });

    stream.on('text', (delta) => {
      res.write(delta);
    });
    stream.on('error', (err) => {
      console.error('[scribe] chat stream error:', err);
      if (!res.writableEnded) {
        res.write('\n\n*Something went wrong mid-answer — please try again.*');
        res.end();
      }
    });
    stream.on('end', () => {
      if (!res.writableEnded) res.end();
    });

    req.on('close', () => {
      stream.abort();
    });
  } catch (err) {
    next(err);
  }
});
