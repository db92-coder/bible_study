import { Router } from 'express';
import { z } from 'zod';
import { BOOKS, findBook } from '../data/books.js';
import { anthropic, STUDY_MODEL } from '../lib/anthropic.js';
import { envVar } from '../lib/env.js';
import { getChapter, resolveVersion, type ChapterContent } from '../lib/bibleApi.js';
import { supabase } from '../lib/supabase.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export const searchRouter = Router();

export interface SearchResult {
  book: string;
  chapter: number;
  verse_start: number;
  verse_end: number;
  label: string;
  why: string | null;
  text: string | null;
}

const TOPICAL_SYSTEM_PROMPT = `You are the passage-finder of a Bible study app. Given a topic, feeling, or question, you return the Bible passages that most genuinely address it.

Respond with ONLY a JSON array — no prose, no code fences. Each element:
{"book": "<full book name>", "chapter": <int>, "verse_start": <int>, "verse_end": <int>, "why": "<one short sentence on how this passage speaks to the topic>"}

Rules:
- 12 to 20 results, ordered most relevant first.
- Draw from both testaments where the topic allows.
- Prefer passages that truly address the topic over famous-but-tangential ones.
- Keep ranges tight (1–4 verses); verse_end equals verse_start for single verses.
- Book names exactly like: Genesis, 1 Samuel, Psalms, Song of Solomon, Matthew, 1 Corinthians, Revelation.`;

const memoryCache = new Map<string, SearchResult[]>();
const usfmIndex = new Map(BOOKS.map((b) => [b.usfm, b]));

async function enrichWithText(
  results: Array<{ book: string; chapter: number; verse_start: number; verse_end: number; why: string | null }>,
): Promise<SearchResult[]> {
  const web = await resolveVersion('WEB');
  const chapters = new Map<string, Promise<ChapterContent | null>>();
  if (web) {
    for (const r of results) {
      const key = `${r.book}/${r.chapter}`;
      if (!chapters.has(key)) {
        chapters.set(
          key,
          getChapter(web, r.book, r.chapter).catch(() => null),
        );
      }
    }
  }
  return Promise.all(
    results.map(async (r) => {
      const content = web ? await chapters.get(`${r.book}/${r.chapter}`) : null;
      let text: string | null = null;
      if (content) {
        const verses = content.verses.filter(
          (v) => v.verse >= r.verse_start && v.verse <= r.verse_end,
        );
        if (verses.length > 0) {
          text = verses.map((v) => v.text).join(' ');
          if (text.length > 320) text = `${text.slice(0, 317)}…`;
        }
      }
      const range = r.verse_end !== r.verse_start ? `–${r.verse_end}` : '';
      return { ...r, label: `${r.book} ${r.chapter}:${r.verse_start}${range}`, text };
    }),
  );
}

searchRouter.get('/search/topical', verifyFirebaseToken, async (req, res, next) => {
  try {
    const q = z.string().min(2).max(120).parse(req.query.q).trim();
    const normalized = q.toLowerCase().replace(/\s+/g, ' ');

    if (supabase) {
      const cached = await supabase
        .from('topical_search_cache')
        .select('results')
        .eq('query', normalized)
        .maybeSingle();
      if (cached.data?.results) {
        res.json({ query: q, results: cached.data.results, cached: true });
        return;
      }
    }
    if (memoryCache.has(normalized)) {
      res.json({ query: q, results: memoryCache.get(normalized), cached: true });
      return;
    }

    if (!anthropic) {
      res.status(503).json({ error: 'AI features are not configured' });
      return;
    }

    const message = await anthropic.messages.create({
      model: STUDY_MODEL,
      max_tokens: 1800,
      system: TOPICAL_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: q }],
    });
    const raw = message.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .replace(/```json|```/g, '')
      .trim();

    const itemSchema = z.object({
      book: z.string(),
      chapter: z.number().int().min(1),
      verse_start: z.number().int().min(1),
      verse_end: z.number().int().min(1),
      why: z.string().max(300).nullable().optional(),
    });
    const parsed = z.array(itemSchema).parse(JSON.parse(raw));

    const valid = parsed
      .map((r) => {
        const info = findBook(r.book);
        if (!info || r.chapter > info.chapters) return null;
        const start = r.verse_start;
        const end = Math.max(start, Math.min(r.verse_end, start + 6));
        return { book: info.name, chapter: r.chapter, verse_start: start, verse_end: end, why: r.why ?? null };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null)
      .slice(0, 20);

    const results = await enrichWithText(valid);

    memoryCache.set(normalized, results);
    if (supabase) {
      const { error } = await supabase
        .from('topical_search_cache')
        .upsert({ query: normalized, results });
      if (error) console.warn('[scribe] topical_search_cache write failed:', error.message);
    }

    res.json({ query: q, results, cached: false });
  } catch (err) {
    next(err);
  }
});

// Exact-word search via API.Bible's search endpoint.
searchRouter.get('/search/text', verifyFirebaseToken, async (req, res, next) => {
  try {
    const q = z.string().min(2).max(120).parse(req.query.q).trim();
    const apiKey = envVar('API_BIBLE_KEY');
    if (!apiKey) {
      res.status(503).json({ error: 'Word search requires an API.Bible key' });
      return;
    }
    const web = await resolveVersion(String(req.query.version ?? 'WEB'));
    if (!web) {
      res.status(400).json({ error: 'Unknown version' });
      return;
    }

    const url = `https://rest.api.bible/v1/bibles/${web.id}/search?query=${encodeURIComponent(q)}&limit=25&sort=relevance`;
    const apiRes = await fetch(url, { headers: { 'api-key': apiKey } });
    if (!apiRes.ok) {
      throw new Error(`API.Bible search responded ${apiRes.status}`);
    }
    const payload = (await apiRes.json()) as {
      data?: { verses?: Array<{ id: string; reference: string; text: string }> };
    };

    const results: SearchResult[] = [];
    for (const v of payload.data?.verses ?? []) {
      const [usfm, chapterStr, verseStr] = v.id.split('.');
      const info = usfmIndex.get(usfm);
      const chapter = Number(chapterStr);
      const verse = Number(verseStr);
      if (!info || !Number.isFinite(chapter) || !Number.isFinite(verse)) continue;
      const text = v.text ? (v.text.length > 320 ? `${v.text.slice(0, 317)}…` : v.text) : null;
      results.push({
        book: info.name,
        chapter,
        verse_start: verse,
        verse_end: verse,
        label: v.reference,
        why: null,
        text,
      });
    }

    res.json({ query: q, results });
  } catch (err) {
    next(err);
  }
});
