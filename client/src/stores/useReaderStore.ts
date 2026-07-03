import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { adjacentChapter } from '../data/books';

export interface VerseSelection {
  start: number;
  end: number;
}

interface ReaderState {
  book: string;
  chapter: number;
  version: string;
  selection: VerseSelection | null;
  setLocation: (book: string, chapter: number) => void;
  setVersion: (version: string) => void;
  goToAdjacentChapter: (direction: 1 | -1) => void;
  selectVerse: (verse: number, extend: boolean) => void;
  clearSelection: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      book: 'John',
      chapter: 1,
      version: 'WEB',
      selection: null,
      setLocation: (book, chapter) => set({ book, chapter, selection: null }),
      setVersion: (version) => set({ version }),
      goToAdjacentChapter: (direction) => {
        const { book, chapter } = get();
        const target = adjacentChapter(book, chapter, direction);
        if (target) set({ book: target.book, chapter: target.chapter, selection: null });
      },
      selectVerse: (verse, extend) => {
        const { selection } = get();
        if (extend && selection) {
          set({
            selection: {
              start: Math.min(selection.start, verse),
              end: Math.max(selection.end, verse),
            },
          });
        } else if (selection && selection.start === verse && selection.end === verse) {
          set({ selection: null });
        } else {
          set({ selection: { start: verse, end: verse } });
        }
      },
      clearSelection: () => set({ selection: null }),
    }),
    {
      name: 'scribe-reader',
      partialize: (s) => ({ book: s.book, chapter: s.chapter, version: s.version }),
    },
  ),
);
