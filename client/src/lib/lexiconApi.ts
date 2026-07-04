import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface LexiconWord {
  id: string;
  language: 'Hebrew' | 'Greek';
  lemma: string | null;
  translit: string | null;
  pron: string | null;
  derivation: string | null;
  strongs_def: string | null;
  kjv_def: string | null;
  note?: string;
}

export interface ArticleSummary {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
}

export interface Article extends ArticleSummary {
  related_words: string[];
  body_md: string;
}

export function useFeaturedWords() {
  return useQuery({
    queryKey: ['lexicon', 'featured'],
    queryFn: async () => (await api.get<{ words: LexiconWord[] }>('/lexicon/featured')).data.words,
    staleTime: Infinity,
  });
}

export function useLexiconSearch(q: string) {
  return useQuery({
    queryKey: ['lexicon', 'search', q],
    enabled: q.trim().length >= 2,
    queryFn: async () =>
      (await api.get<{ results: LexiconWord[] }>(`/lexicon/search?q=${encodeURIComponent(q)}`)).data
        .results,
    staleTime: 5 * 60_000,
  });
}

export function useCultureArticles() {
  return useQuery({
    queryKey: ['culture'],
    queryFn: async () =>
      (await api.get<{ articles: ArticleSummary[] }>('/culture')).data.articles,
    staleTime: Infinity,
  });
}

export function useCultureArticle(slug: string | null) {
  return useQuery({
    queryKey: ['culture', slug],
    enabled: slug !== null,
    queryFn: async () => (await api.get<{ article: Article }>(`/culture/${slug}`)).data.article,
    staleTime: Infinity,
  });
}
