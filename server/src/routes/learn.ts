import { Router } from 'express';
import { LEARN_LESSONS, LESSONS_BY_SLUG } from '../data/learnLessons.js';

export const learnRouter = Router();

learnRouter.get('/learn', (_req, res) => {
  res.json({
    lessons: LEARN_LESSONS.map(({ slug, order, title, summary }) => ({
      slug,
      order,
      title,
      summary,
    })),
  });
});

learnRouter.get('/learn/:slug', (req, res) => {
  const lesson = LESSONS_BY_SLUG.get(String(req.params.slug ?? ''));
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }
  res.json({ lesson });
});
