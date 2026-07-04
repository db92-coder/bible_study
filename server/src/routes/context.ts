import { Router } from 'express';
import { z } from 'zod';
import { BOOK_CONTEXT_BY_NAME } from '../data/bookContext.js';
import { findBook } from '../data/books.js';
import { anthropic, STUDY_MODEL } from '../lib/anthropic.js';
import { supabase } from '../lib/supabase.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';
import { PLACES } from './places.js';

export const contextRouter = Router();

const BRIEF_SYSTEM_PROMPT = `You are the study assistant of Scribe, a Bible study app. You write concise historical-context briefs for individual Bible chapters.

Rules:
- Draw only on the biblical text and mainstream, public scholarship (the kind found in standard study-Bible notes and public-domain commentaries).
- Present differing interpretive traditions neutrally; say "interpretations differ" rather than picking a side on contested questions.
- No devotional application, no sermonizing — historical, cultural, and geographical context only.
- Reference verses inline like (v. 12) or (vv. 3–5).

Format: markdown with exactly these three sections, nothing before or after:
## Setting & geography
## Culture & customs
## Worth noticing

The last section is 2–3 bullet points connecting the cultural background to specific details in the chapter. Total length 220–320 words.`;

// In-memory fallback cache for dev / until migration 003 is applied.
const briefMemoryCache = new Map<string, string>();

function chapterPlaceNames(osis: string, chapter: number): string[] {
  const prefix = `${osis}.${chapter}.`;
  const exact = `${osis}.${chapter}`;
  return PLACES.filter((p) => p.verse_refs.some((r) => r === exact || r.startsWith(prefix)))
    .map((p) => p.name)
    .slice(0, 15);
}

contextRouter.get('/context/:book/:chapter', verifyFirebaseToken, async (req, res, next) => {
  try {
    const params = z
      .object({ book: z.string().min(2).max(30), chapter: z.coerce.number().int().min(1) })
      .parse(req.params);
    const bookInfo = findBook(params.book);
    if (!bookInfo || params.chapter > bookInfo.chapters) {
      res.status(400).json({ error: 'Unknown book or chapter' });
      return;
    }
    const { name: book } = bookInfo;
    const chapter = params.chapter;
    const cacheKey = `${book}/${chapter}`;

    // 1. Permanent cache in Postgres
    if (supabase) {
      const cached = await supabase
        .from('chapter_context')
        .select('brief_md')
        .eq('book', book)
        .eq('chapter', chapter)
        .maybeSingle();
      if (cached.data?.brief_md) {
        res.json({ book, chapter, brief_md: cached.data.brief_md, cached: true });
        return;
      }
    }
    // 2. Process-local fallback cache
    if (briefMemoryCache.has(cacheKey)) {
      res.json({ book, chapter, brief_md: briefMemoryCache.get(cacheKey), cached: true });
      return;
    }

    if (!anthropic) {
      res.status(503).json({ error: 'AI features are not configured' });
      return;
    }

    const bookBg = BOOK_CONTEXT_BY_NAME.get(book.toLowerCase());
    const places = chapterPlaceNames(bookInfo.osis, chapter);
    const userPrompt = [
      `Write the chapter brief for **${book} ${chapter}**.`,
      bookBg
        ? `Book background — author: ${bookBg.author}; date: ${bookBg.date_written}; audience: ${bookBg.audience}; setting: ${bookBg.historical_setting_md}`
        : null,
      places.length > 0
        ? `Places mentioned in this chapter (OpenBible geodata): ${places.join(', ')}.`
        : 'No places are recorded for this chapter in the geodata.',
    ]
      .filter(Boolean)
      .join('\n\n');

    const message = await anthropic.messages.create({
      model: STUDY_MODEL,
      max_tokens: 1000,
      system: BRIEF_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const brief = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();
    if (!brief) {
      res.status(502).json({ error: 'Brief generation returned no text' });
      return;
    }

    briefMemoryCache.set(cacheKey, brief);
    if (supabase) {
      const { error } = await supabase
        .from('chapter_context')
        .upsert({ book, chapter, brief_md: brief, model: STUDY_MODEL });
      if (error) console.warn('[scribe] chapter_context write failed:', error.message);
    }

    res.json({ book, chapter, brief_md: brief, cached: false });
  } catch (err) {
    next(err);
  }
});

contextRouter.get('/context/:book', async (req, res, next) => {
  try {
    const book = z.string().min(2).max(30).parse(req.params.book);
    const bookInfo = findBook(book);
    if (!bookInfo) {
      res.status(400).json({ error: `Unknown book '${book}'` });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('book_context')
        .select('*')
        .eq('book', bookInfo.name)
        .maybeSingle();
      if (error) {
        // Fall through to the in-code seed rather than failing the request.
        console.warn('[scribe] book_context read failed:', error.message);
      } else if (data) {
        res.json(data);
        return;
      }
    }

    // Fall back to the in-code seed so the context panel works without Supabase.
    const seeded = BOOK_CONTEXT_BY_NAME.get(bookInfo.name.toLowerCase());
    if (!seeded) {
      res.status(404).json({ error: `No context available for ${bookInfo.name}` });
      return;
    }
    res.json({ ...seeded, author_journey: null });
  } catch (err) {
    next(err);
  }
});
