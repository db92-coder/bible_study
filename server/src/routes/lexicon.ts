import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { findBook } from '../data/books.js';
import { FEATURED_WORDS } from '../data/featuredWords.js';
import { anthropic, STUDY_MODEL } from '../lib/anthropic.js';
import { getChapter, resolveVersion } from '../lib/bibleApi.js';
import { supabase } from '../lib/supabase.js';
import { verifyFirebaseToken } from '../middleware/verifyFirebaseToken.js';

export interface LexiconEntry {
  lemma: string | null;
  translit: string | null;
  pron: string | null;
  derivation: string | null;
  strongs_def: string | null;
  kjv_def: string | null;
}

// Strong's Hebrew (8,674) + Greek (5,523) dictionaries, public domain,
// JSON edition by Open Scriptures (CC-BY-SA).
const LEXICON: Record<string, LexiconEntry> = JSON.parse(
  readFileSync(new URL('../data/lexicon.json', import.meta.url), 'utf-8'),
);

function withId(id: string) {
  const entry = LEXICON[id];
  if (!entry) return null;
  return { id, language: id.startsWith('H') ? 'Hebrew' : 'Greek', ...entry };
}

function normalizeId(raw: string): string | null {
  const m = raw.trim().toUpperCase().match(/^([HG])\s*0*(\d{1,4})$/);
  return m ? `${m[1]}${m[2]}` : null;
}

// Same consonant-skeleton fuzzy match as /lexicon/search, exposed so other
// routes can check a model-supplied (Strong's id, transliteration) pairing
// actually corresponds to a real lexicon entry before trusting it.
export function strongsIdMatchesWord(rawId: string, displayText: string): boolean {
  const id = normalizeId(rawId);
  if (!id || !LEXICON[id]) return false;
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/ç/g, 's')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/g, '');
  const skeleton = (s: string) => clean(s).replace(/[aeiouwy]/g, '');
  const a = skeleton(displayText);
  const b = skeleton(LEXICON[id].translit ?? '');
  return a.length >= 2 && a === b;
}

// The model sometimes pairs a real (non-hallucinated) Strong's id with the
// wrong English gloss — e.g. picking a lookalike word from the same chapter.
// kjv_def lists every KJV rendering of that entry, so require the gloss to
// share a word stem with it before trusting the pairing.
function glossMatchesEntry(kjvDef: string | null, gloss: string): boolean {
  if (!kjvDef) return true;
  const stem = (s: string) => s.slice(0, 5);
  const tokens = (s: string) =>
    s
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((t) => t.length >= 3)
      .map(stem);
  const defStems = new Set(tokens(kjvDef));
  return tokens(gloss).some((t) => defStems.has(t));
}

const CHAPTER_WORDS_SYSTEM_PROMPT = `You are the word-study assistant of Scribe, a Bible study app. Given the text of one Bible chapter, pick out the Hebrew or Greek words most worth a reader studying more closely — words with theological weight, words that lose nuance in translation, or words that recur meaningfully.

Respond with ONLY a JSON array — no prose, no code fences. Each element:
{"id": "<Strong's number, e.g. H2617 or G26>", "gloss": "<the exact English word or short phrase as it appears in the chapter text given>"}

Rules:
- 3 to 8 words, ordered by where they first appear in the chapter.
- Only pick words whose English gloss genuinely appears in the chapter text given.
- Prefer words with real theological or cultural weight over common connective words.
- Use correct Strong's numbers — do not guess or invent one if unsure, and double-check that the number you give is actually the underlying word behind that specific English gloss, not a different word from elsewhere in the chapter.`;

interface ChapterWordPick {
  id: string;
  gloss: string;
}

// In-memory fallback cache for dev / until migration 009 is applied.
const chapterWordsMemoryCache = new Map<string, ChapterWordPick[]>();

export const lexiconRouter = Router();

lexiconRouter.get('/lexicon/featured', (_req, res) => {
  const words = FEATURED_WORDS.map((f) => {
    const entry = withId(f.id);
    return entry ? { ...entry, note: f.note } : null;
  }).filter(Boolean);
  res.json({ words });
});

lexiconRouter.get('/lexicon/chapter/:book/:chapter', verifyFirebaseToken, async (req, res, next) => {
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

    let picks: ChapterWordPick[] | null = null;

    if (supabase) {
      const cached = await supabase
        .from('chapter_words')
        .select('words')
        .eq('book', book)
        .eq('chapter', chapter)
        .maybeSingle();
      if (cached.data?.words) {
        picks = cached.data.words as ChapterWordPick[];
      } else if (cached.error) {
        // Migration 009 not applied yet — memory cache still works.
        console.warn('[scribe] chapter_words read failed:', cached.error.message);
      }
    }
    if (!picks && chapterWordsMemoryCache.has(cacheKey)) {
      picks = chapterWordsMemoryCache.get(cacheKey)!;
    }

    if (!picks) {
      if (!anthropic) {
        res.status(503).json({ error: 'AI features are not configured' });
        return;
      }
      const versionInfo = await resolveVersion('WEB');
      if (!versionInfo) {
        res.status(503).json({ error: 'Scripture text unavailable' });
        return;
      }
      const chapterContent = await getChapter(versionInfo, book, chapter);
      const chapterText = chapterContent.verses.map((v) => `${v.verse}. ${v.text}`).join(' ');

      const message = await anthropic.messages.create({
        model: STUDY_MODEL,
        max_tokens: 600,
        system: CHAPTER_WORDS_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: `${book} ${chapter} (WEB translation):\n\n${chapterText}` }],
      });
      const raw = message.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .replace(/```json|```/g, '')
        .trim();

      const itemSchema = z.object({ id: z.string(), gloss: z.string().max(40) });
      const parsed = z.array(itemSchema).parse(JSON.parse(raw));

      // Ground against the real lexicon — drop anything the model hallucinated
      // or mismatched (a real id paired with the wrong gloss).
      picks = parsed
        .map((p) => {
          const id = normalizeId(p.id);
          if (!id || !LEXICON[id]) return null;
          if (!glossMatchesEntry(LEXICON[id].kjv_def, p.gloss)) return null;
          return { id, gloss: p.gloss };
        })
        .filter((p): p is ChapterWordPick => p !== null)
        .slice(0, 8);

      chapterWordsMemoryCache.set(cacheKey, picks);
      if (supabase) {
        const { error } = await supabase
          .from('chapter_words')
          .upsert({ book, chapter, words: picks, model: STUDY_MODEL });
        if (error) console.warn('[scribe] chapter_words write failed:', error.message);
      }
    }

    const words = picks
      .map((p) => {
        const entry = withId(p.id);
        return entry ? { ...entry, gloss: p.gloss } : null;
      })
      .filter(Boolean);
    res.json({ words });
  } catch (err) {
    next(err);
  }
});

lexiconRouter.get('/lexicon/search', (req, res, next) => {
  try {
    const q = z.string().min(1).max(60).parse(req.query.q).trim();

    // Direct Strong's number (e.g. "H2617", "g26")
    const direct = normalizeId(q);
    if (direct) {
      const entry = withId(direct);
      res.json({ results: entry ? [entry] : [] });
      return;
    }

    // Strong's transliteration uses ç for s-sounds and writes long vowels with
    // glides (shâlôwm), so normalize hard before comparing: strip diacritics,
    // then reduce to a consonant skeleton (drop vowels/glides) as a fallback.
    const clean = (s: string) =>
      s
        .toLowerCase()
        .replace(/ç/g, 's')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z]/g, '');
    const skeleton = (s: string) => clean(s).replace(/[aeiouwy]/g, '');

    const needle = q.toLowerCase();
    const cleanNeedle = clean(q);
    const skelNeedle = skeleton(q);
    const results: NonNullable<ReturnType<typeof withId>>[] = [];
    const add = (id: string) => {
      if (results.length < 20 && !results.some((r) => r.id === id)) results.push(withId(id)!);
    };

    // Pass 1: transliteration containment; pass 2: consonant-skeleton match;
    // pass 3: English definition containment.
    for (const pass of [1, 2, 3] as const) {
      for (const id of Object.keys(LEXICON)) {
        if (results.length >= 20) break;
        const e = LEXICON[id];
        let hit = false;
        if (pass === 1) {
          hit = e.lemma === q || (cleanNeedle.length >= 3 && clean(e.translit ?? '').includes(cleanNeedle));
        } else if (pass === 2) {
          hit = skelNeedle.length >= 2 && skeleton(e.translit ?? '') === skelNeedle;
        } else {
          hit =
            (e.strongs_def?.toLowerCase().includes(needle) ?? false) ||
            (e.kjv_def?.toLowerCase().includes(needle) ?? false);
        }
        if (hit) add(id);
      }
      if (results.length >= 20) break;
    }
    res.json({ results });
  } catch (err) {
    next(err);
  }
});

lexiconRouter.get('/lexicon/:strongs', (req, res) => {
  const id = normalizeId(String(req.params.strongs ?? ''));
  if (!id) {
    res.status(400).json({ error: "Strong's number must look like H2617 or G26" });
    return;
  }
  const entry = withId(id);
  if (!entry) {
    res.status(404).json({ error: `No entry for ${id}` });
    return;
  }
  res.json({ entry });
});
