import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface Passage {
  book: string;
  chapter_start: number;
  chapter_end?: number;
}

export interface PlanDay {
  id?: string;
  day_number: number;
  passages: Passage[];
  reflection_prompt: string | null;
}

export interface PlanSummary {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  is_mine: boolean;
  day_count: number;
  completed_count: number;
}

export interface ProgressRow {
  plan_id?: string;
  day_number: number;
  completed_at: string;
}

export interface PlanDetail {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  is_mine: boolean;
  plan_days: PlanDay[];
}

export interface PlanInput {
  title: string;
  description: string;
  days: Array<Omit<PlanDay, 'id'>>;
}

export function passageLabel(p: Passage) {
  return p.chapter_end && p.chapter_end !== p.chapter_start
    ? `${p.book} ${p.chapter_start}–${p.chapter_end}`
    : `${p.book} ${p.chapter_start}`;
}

/** Consecutive-day streak from completion timestamps, ending today or yesterday. */
export function computeStreak(progress: ProgressRow[]): number {
  const days = new Set(progress.map((p) => new Date(p.completed_at).toDateString()));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1); // allow "yesterday"
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface GeneratePlanInput {
  goal?: string;
  knowledge_level?: 'new' | 'some' | 'experienced';
  age_group?: string;
}

export async function generatePlan(input: GeneratePlanInput): Promise<PlanInput> {
  return (await api.post<{ plan: PlanInput }>('/plans/generate', input)).data.plan;
}

export function usePlans() {
  return useQuery({
    queryKey: ['plans'],
    queryFn: async () =>
      (await api.get<{ plans: PlanSummary[]; progress: ProgressRow[] }>('/plans')).data,
  });
}

export function usePlan(id: string | null) {
  return useQuery({
    queryKey: ['plan', id],
    enabled: id !== null,
    queryFn: async () =>
      (await api.get<{ plan: PlanDetail; progress: ProgressRow[] }>(`/plans/${id}`)).data,
  });
}

export function usePlanMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['plans'] });
    qc.invalidateQueries({ queryKey: ['plan'] });
  };

  const create = useMutation({
    mutationFn: async (input: PlanInput) =>
      (await api.post<{ plan: { id: string } }>('/plans', input)).data.plan,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: PlanInput & { id: string }) =>
      (await api.put(`/plans/${id}`, input)).data,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/plans/${id}`),
    onSuccess: invalidate,
  });
  const setProgress = useMutation({
    mutationFn: async (args: { planId: string; day_number: number; completed: boolean }) =>
      api.post(`/plans/${args.planId}/progress`, {
        day_number: args.day_number,
        completed: args.completed,
      }),
    onSuccess: invalidate,
  });
  return { create, update, remove, setProgress };
}
