import { Router } from 'express';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { findBook } from '../data/books.js';
import { JOURNEYS_BY_BOOK } from '../data/journeys.js';

export interface Place {
  name: string;
  modern_name: string | null;
  lat: number;
  lon: number;
  verse_refs: string[];
  era: string;
  description: string;
}

// 1,278 places from the OpenBible.info geocoding data (CC-BY). Served from
// memory — small enough, and it keeps the map fast with zero DB round-trips.
export const PLACES: Place[] = JSON.parse(
  readFileSync(new URL('../data/places.json', import.meta.url), 'utf-8'),
);

export const ERAS = [
  'Patriarchs',
  'Exodus & Conquest',
  'Kingdom',
  'Exile & Return',
  'New Testament',
];

const querySchema = z.object({
  book: z.string().min(2).max(30).optional(),
  era: z.string().max(30).optional(),
});

export const placesRouter = Router();

placesRouter.get('/places', (req, res, next) => {
  try {
    const { book, era } = querySchema.parse(req.query);

    let results = PLACES;
    if (book) {
      const bookInfo = findBook(book);
      if (!bookInfo) {
        res.status(400).json({ error: `Unknown book '${book}'` });
        return;
      }
      const prefix = `${bookInfo.osis}.`;
      results = results.filter((p) => p.verse_refs.some((r) => r.startsWith(prefix)));
    }
    if (era && era !== 'All') {
      results = results.filter((p) => p.era === era);
    }

    res.json({ places: results, eras: ERAS });
  } catch (err) {
    next(err);
  }
});

placesRouter.get('/places/journeys/:book', (req, res) => {
  const bookInfo = findBook(String(req.params.book ?? ''));
  if (!bookInfo) {
    res.status(400).json({ error: 'Unknown book' });
    return;
  }
  res.json({ journeys: JOURNEYS_BY_BOOK[bookInfo.name] ?? [] });
});
