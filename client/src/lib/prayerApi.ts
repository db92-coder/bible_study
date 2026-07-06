import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export type PrayerCategory = 'person' | 'situation' | 'world' | 'thanksgiving' | 'other';
export type PrayerStatus = 'active' | 'answered';

export interface PrayerRequest {
  id: string;
  title: string;
  category: PrayerCategory;
  body_md: string;
  status: PrayerStatus;
  answered_note: string | null;
  answered_at: string | null;
  created_at: string;
}

export type PrayerRequestInput = {
  title: string;
  category: PrayerCategory;
  body_md: string;
};

export interface PrayerStep {
  key: string;
  title: string;
  teaching: string;
  scripture_ref?: string;
  placeholder: string;
  show_requests?: boolean;
}

export interface PrayerPatternSummary {
  slug: string;
  title: string;
  summary: string;
}

export interface PrayerPattern extends PrayerPatternSummary {
  intro_md: string;
  uses_passage_picker: boolean;
  default_book?: string;
  default_chapter?: number;
  steps: PrayerStep[];
}

export const CATEGORY_LABELS: Record<PrayerCategory, string> = {
  person: 'A person',
  situation: 'A situation',
  world: 'The world',
  thanksgiving: 'Thanksgiving',
  other: 'Other',
};

export function usePrayerPatterns() {
  return useQuery({
    queryKey: ['prayer', 'patterns'],
    queryFn: async () =>
      (await api.get<{ patterns: PrayerPatternSummary[] }>('/prayer/patterns')).data.patterns,
    staleTime: Infinity,
  });
}

export function usePrayerPattern(slug: string | null) {
  return useQuery({
    queryKey: ['prayer', 'patterns', slug],
    enabled: slug !== null,
    queryFn: async () =>
      (await api.get<{ pattern: PrayerPattern }>(`/prayer/patterns/${slug}`)).data.pattern,
    staleTime: Infinity,
  });
}

export function usePrayerRequests(status?: PrayerStatus) {
  return useQuery({
    queryKey: ['prayer', 'requests', status ?? 'all'],
    queryFn: async () => {
      const params = status ? `?status=${status}` : '';
      return (await api.get<{ requests: PrayerRequest[] }>(`/prayer/requests${params}`)).data
        .requests;
    },
  });
}

export function usePrayerMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['prayer', 'requests'] });

  const create = useMutation({
    mutationFn: async (input: PrayerRequestInput) =>
      (await api.post<{ request: PrayerRequest }>('/prayer/requests', input)).data.request,
    onSuccess: invalidate,
  });
  const markAnswered = useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) =>
      (
        await api.patch<{ request: PrayerRequest }>(`/prayer/requests/${id}`, {
          status: 'answered',
          answered_note: note,
        })
      ).data.request,
    onSuccess: invalidate,
  });
  const reopen = useMutation({
    mutationFn: async (id: string) =>
      (await api.patch<{ request: PrayerRequest }>(`/prayer/requests/${id}`, { status: 'active' }))
        .data.request,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/prayer/requests/${id}`),
    onSuccess: invalidate,
  });
  return { create, markAnswered, reopen, remove };
}
