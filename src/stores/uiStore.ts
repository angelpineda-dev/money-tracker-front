import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface UiState {
    themeMode: ThemeMode;
    toggleTheme: () => void;
}

const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            themeMode: prefersDark ? 'dark' : 'light',
            toggleTheme: () => set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })),
        }),
        { name: 'mt-ui', storage: createJSONStorage(() => localStorage) },
    ),
);
