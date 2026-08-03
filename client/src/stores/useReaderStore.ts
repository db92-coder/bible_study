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
  // Whichever verse was most recently tapped — may be either end of the
  // range. Used to anchor the selection popup to where the user's
  // finger/cursor actually is, not always the top or bottom of the range.
  lastTapped: number | null;
  setLocation: (book: string, chapter: number) => void;
  setVersion: (version: string) => void;
  goToAdjacentChapter: (direction: 1 | -1) => void;
  selectVerse: (verse: number) => void;
  clearSelection: () => void;
}

export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      book: 'John',
      chapter: 1,
      version: 'WEB',
      selection: null,
      lastTapped: null,
      setLocation: (book, chapter) => set({ book, chapter, selection: null, lastTapped: null }),
      setVersion: (version) => set({ version }),
      goToAdjacentChapter: (direction) => {
        const { book, chapter } = get();
        const target = adjacentChapter(book, chapter, direction);
        if (target) {
          set({ book: target.book, chapter: target.chapter, selection: null, lastTapped: null });
        }
      },
      // Tap a verse with nothing selected → select it alone. Tap a second,
      // different verse → extend to the range between them (no shift key
      // needed, so this works the same on touch as it does with a mouse).
      // Tap the sole selected verse again → clear. There's no shift-key
      // signal on mobile, so this is the only selection model — a click
      // that would have started a *new* single-verse selection while one
      // is already active is treated as extending it; use Clear to restart.
      selectVerse: (verse) => {
        const { selection } = get();
        if (!selection) {
          set({ selection: { start: verse, end: verse }, lastTapped: verse });
        } else if (selection.start === verse && selection.end === verse) {
          set({ selection: null, lastTapped: null });
        } else {
          set({
            selection: {
              start: Math.min(selection.start, verse),
              end: Math.max(selection.end, verse),
            },
            lastTapped: verse,
          });
        }
      },
      clearSelection: () => set({ selection: null, lastTapped: null }),
    }),
    {
      name: 'scribe-reader',
      partialize: (s) => ({ book: s.book, chapter: s.chapter, version: s.version }),
    },
  ),
);
