import { Router } from 'express';
import { z } from 'zod';
import { findBook } from '../data/books.js';
import { getChapter, resolveVersion } from '../lib/bibleApi.js';

export const scriptureRouter = Router();

const paramsSchema = z.object({
  version: z.string().min(2).max(40),
  book: z.string().min(2).max(30),
  chapter: z.coerce.number().int().min(1),
});

scriptureRouter.get('/scripture/:version/:book/:chapter', async (req, res, next) => {
  try {
    const { version, book, chapter } = paramsSchema.parse(req.params);

    const versionInfo = await resolveVersion(version);
    if (!versionInfo) {
      res.status(400).json({ error: `Unknown version '${version}'` });
      return;
    }
    const bookInfo = findBook(book);
    if (!bookInfo) {
      res.status(400).json({ error: `Unknown book '${book}'` });
      return;
    }
    if (chapter > bookInfo.chapters) {
      res.status(400).json({ error: `${bookInfo.name} has ${bookInfo.chapters} chapters` });
      return;
    }

    const content = await getChapter(versionInfo, bookInfo.name, chapter);
    res.json(content);
  } catch (err) {
    next(err);
  }
});
