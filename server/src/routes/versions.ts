import { Router } from 'express';
import { listVersions } from '../lib/bibleApi.js';

export const versionsRouter = Router();

versionsRouter.get('/versions', async (_req, res, next) => {
  try {
    res.json({ versions: await listVersions() });
  } catch (err) {
    next(err);
  }
});
