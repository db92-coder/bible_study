import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface RefPoint {
  book: string;
  chapter: number;
}

export interface Connection {
  id: string;
  kind: 'prophecy' | 'connection' | 'user';
  group: string;
  category: string;
  title: string;
  description: string;
  significance: string | null;
  source_text: string | null;
  ot: { label: string; refs: RefPoint[] };
  nt: { label: string; refs: RefPoint[] };
}

export interface UserConnectionInput {
  title: string;
  category: string;
  description: string;
  ot: RefPoint;
  nt: RefPoint;
}

export const GROUP_COLORS: Record<string, string> = {
  Prophecy: '#b48a3c',
  'Type & Shadow': '#2f6f6a',
  Covenant: '#7a4a8b',
  Theme: '#8b3a3a',
  Personal: '#4a6fa5',
};

export function useConnections() {
  return useQuery({
    queryKey: ['connections'],
    queryFn: async () =>
      (await api.get<{ connections: Connection[] }>('/connections')).data.connections,
    staleTime: Infinity,
  });
}

export function useMyConnections() {
  return useQuery({
    queryKey: ['connections', 'mine'],
    queryFn: async () =>
      (await api.get<{ connections: Connection[]; unavailable?: boolean }>('/connections/mine'))
        .data,
  });
}

export function useConnectionMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['connections', 'mine'] });

  const create = useMutation({
    mutationFn: async (input: UserConnectionInput) =>
      (await api.post<{ connection: Connection }>('/connections/mine', input)).data.connection,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/connections/mine/${id.replace(/^u-/, '')}`),
    onSuccess: invalidate,
  });
  return { create, remove };
}
