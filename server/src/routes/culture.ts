import { Router } from 'express';
import { ARTICLES_BY_SLUG, CULTURE_ARTICLES } from '../data/cultureArticles.js';

export const cultureRouter = Router();

cultureRouter.get('/culture', (_req, res) => {
  res.json({
    articles: CULTURE_ARTICLES.map(({ slug, title, summary, tags }) => ({
      slug,
      title,
      summary,
      tags,
    })),
  });
});

cultureRouter.get('/culture/:slug', (req, res) => {
  const article = ARTICLES_BY_SLUG.get(String(req.params.slug ?? ''));
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }
  res.json({ article });
});
