import { create } from 'zustand';

interface ThemeState {
  dark: boolean;
  toggle: () => void;
}

const initialDark = localStorage.getItem('scribe-theme') === 'dark';
document.documentElement.classList.toggle('dark', initialDark);

export const useThemeStore = create<ThemeState>((set, get) => ({
  dark: initialDark,
  toggle: () => {
    const dark = !get().dark;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('scribe-theme', dark ? 'dark' : 'light');
    set({ dark });
  },
}));
