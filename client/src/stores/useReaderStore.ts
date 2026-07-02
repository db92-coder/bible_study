import { create } from 'zustand';

interface ReaderState {
  book: string;
  chapter: number;
  version: string;
  setLocation: (book: string, chapter: number) => void;
  setVersion: (version: string) => void;
}

export const useReaderStore = create<ReaderState>((set) => ({
  book: 'John',
  chapter: 1,
  version: 'WEB',
  setLocation: (book, chapter) => set({ book, chapter }),
  setVersion: (version) => set({ version }),
}));
