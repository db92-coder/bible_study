import './env.js';

import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { ZodError } from 'zod';
import { meRouter } from './routes/me.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'scribe-server' });
});

app.use('/api', meRouter);

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

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
  console.log(`[scribe] server listening on http://localhost:${port}`);
});
