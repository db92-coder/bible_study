import './env.js';

import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { chatRouter } from './routes/chat.js';
import { connectionsRouter } from './routes/connections.js';
import { contextRouter } from './routes/context.js';
import { cultureRouter } from './routes/culture.js';
import { devotionalRouter } from './routes/devotional.js';
import { exportRouter } from './routes/export.js';
import { prayerRouter } from './routes/prayer.js';
import { graphRouter } from './routes/graph.js';
import { learnRouter } from './routes/learn.js';
import { lexiconRouter } from './routes/lexicon.js';
import { meRouter } from './routes/me.js';
import { notesRouter } from './routes/notes.js';
import { placesRouter } from './routes/places.js';
import { plansRouter } from './routes/plans.js';
import { scriptureRouter } from './routes/scripture.js';
import { searchRouter } from './routes/search.js';
import { storyRouter } from './routes/story.js';
import { versionsRouter } from './routes/versions.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'scribe-server' });
});

app.use('/api', meRouter);
app.use('/api', scriptureRouter);
app.use('/api', versionsRouter);
app.use('/api', contextRouter);
app.use('/api', placesRouter);
app.use('/api', notesRouter);
app.use('/api', plansRouter);
app.use('/api', connectionsRouter);
app.use('/api', graphRouter);
app.use('/api', lexiconRouter);
app.use('/api', cultureRouter);
app.use('/api', learnRouter);
app.use('/api', storyRouter);
app.use('/api', chatRouter);
app.use('/api', searchRouter);
app.use('/api', devotionalRouter);
app.use('/api', exportRouter);
app.use('/api', prayerRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Central error handler — Zod issues become 400s, everything else a logged 500.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request', issues: err.issues });
    return;
  }
  console.error('[scribe]', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
