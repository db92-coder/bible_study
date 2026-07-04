import { Router } from 'express';
import { z } from 'zod';
import { BOOK_CONTEXT_BY_NAME } from '../data/bookContext.js';
import { findBook } from '../data/books.js';
import { supabase } from '../lib/supabase.js';

export const contextRouter = Router();

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
