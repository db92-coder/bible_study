import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { findBook } from '../data/books.js';

interface TimelineData {
  eras: Array<{ name: string; start: number; end: number; color: string }>;
  events: Array<{
    id: number;
    title: string;
    year: number;
    era: string;
    scripture: string;
    refs: Array<{ book: string; chapter: number }>;
    description: string;
    significance: string;
  }>;
}

// 49 events across 11 eras, imported from the bible-prophecy-study project.
const TIMELINE: TimelineData = JSON.parse(
  readFileSync(new URL('../data/timeline.json', import.meta.url), 'utf-8'),
);

// Treasury of Scripture Knowledge cross-references via OpenBible.info (CC-BY):
// top 8 by reader votes per verse, keyed "John.3.16" → ["Rom.5.8", ...].
const CROSSREFS: Record<string, string[]> = JSON.parse(
  readFileSync(new URL('../data/crossrefs.json', import.meta.url), 'utf-8'),
);

// Index by chapter for fast per-chapter lookups: "John.3" → { 16: [...] }
const byChapter = new Map<string, Record<number, string[]>>();
for (const [key, refs] of Object.entries(CROSSREFS)) {
  const lastDot = key.lastIndexOf('.');
  const chapterKey = key.slice(0, lastDot);
  const verse = Number(key.slice(lastDot + 1));
  if (!Number.isFinite(verse)) continue;
  let entry = byChapter.get(chapterKey);
  if (!entry) {
    entry = {};
    byChapter.set(chapterKey, entry);
  }
  entry[verse] = refs;
}

export const storyRouter = Router();

storyRouter.get('/timeline', (_req, res) => {
  res.json(TIMELINE);
});

storyRouter.get('/crossrefs/:book/:chapter', (req, res, next) => {
  try {
    const params = z
      .object({ book: z.string().min(2).max(30), chapter: z.coerce.number().int().min(1) })
      .parse(req.params);
    const bookInfo = findBook(params.book);
    if (!bookInfo || params.chapter > bookInfo.chapters) {
      res.status(400).json({ error: 'Unknown book or chapter' });
      return;
    }
    res.json({
      book: bookInfo.name,
      chapter: params.chapter,
      refs: byChapter.get(`${bookInfo.osis}.${params.chapter}`) ?? {},
    });
  } catch (err) {
    next(err);
  }
});
