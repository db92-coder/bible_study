import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';

export interface Note {
  id: string;
  title: string;
  body_md: string;
  book: string | null;
  chapter: number | null;
  verse_start: number | null;
  verse_end: number | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export type NoteInput = Omit<Note, 'id' | 'created_at' | 'updated_at'>;

export function noteAnchorLabel(note: Pick<Note, 'book' | 'chapter' | 'verse_start' | 'verse_end'>) {
  if (!note.book) return null;
  let label = note.book;
  if (note.chapter) {
    label += ` ${note.chapter}`;
    if (note.verse_start) {
      label += `:${note.verse_start}`;
      if (note.verse_end && note.verse_end !== note.verse_start) label += `–${note.verse_end}`;
    }
  }
  return label;
}

export function useNotes(filter?: { book?: string; chapter?: number }) {
  return useQuery({
    queryKey: ['notes', filter?.book ?? null, filter?.chapter ?? null],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.book) params.set('book', filter.book);
      if (filter?.chapter) params.set('chapter', String(filter.chapter));
      return (await api.get<{ notes: Note[] }>(`/notes?${params}`)).data.notes;
    },
  });
}

export function useNoteMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['notes'] });

  const create = useMutation({
    mutationFn: async (input: NoteInput) =>
      (await api.post<{ note: Note }>('/notes', input)).data.note,
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: async ({ id, ...input }: NoteInput & { id: string }) =>
      (await api.put<{ note: Note }>(`/notes/${id}`, input)).data.note,
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: async (id: string) => api.delete(`/notes/${id}`),
    onSuccess: invalidate,
  });
  return { create, update, remove };
}
