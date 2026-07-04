import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LearnState {
  completed: Record<string, boolean>;
  toggleComplete: (slug: string) => void;
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set) => ({
      completed: {},
      toggleComplete: (slug) =>
        set((s) => ({ completed: { ...s.completed, [slug]: !s.completed[slug] } })),
    }),
    { name: 'scribe-learn' },
  ),
);
