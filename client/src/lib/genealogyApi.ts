import { useQuery } from '@tanstack/react-query';
import { api } from './api';

export interface PersonSummary {
  id: string;
  name: string;
  source_ref?: string;
}

export interface PersonFamily {
  person: PersonSummary;
  parents: PersonSummary[];
  grandparents: PersonSummary[];
  children: PersonSummary[];
  grandchildren: PersonSummary[];
}

export interface FamilyTree {
  nodes: Array<{ id: string; name: string }>;
  edges: Array<{ source: string; target: string; relationship: string }>;
}

export function useGenealogyNames() {
  return useQuery({
    queryKey: ['genealogy', 'names'],
    queryFn: async () => (await api.get<{ people: Array<{ id: string; name: string }> }>('/genealogy/names')).data
      .people,
    staleTime: Infinity,
  });
}

export function usePersonFamily(id: string | null) {
  return useQuery({
    queryKey: ['genealogy', 'person', id],
    enabled: id !== null,
    queryFn: async () => (await api.get<PersonFamily>(`/genealogy/person/${id}`)).data,
    staleTime: Infinity,
  });
}

export function useGenealogySearch(q: string) {
  return useQuery({
    queryKey: ['genealogy', 'search', q],
    enabled: q.trim().length >= 2,
    queryFn: async () =>
      (await api.get<{ results: PersonSummary[] }>(`/genealogy/search?q=${encodeURIComponent(q)}`)).data.results,
    staleTime: 5 * 60_000,
  });
}

export function useFamilyTree(id: string | null) {
  return useQuery({
    queryKey: ['genealogy', 'tree', id],
    enabled: id !== null,
    queryFn: async () => (await api.get<FamilyTree>(`/genealogy/tree/${id}`)).data,
    staleTime: Infinity,
  });
}
