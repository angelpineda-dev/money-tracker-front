import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { User } from '@/api/types';

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    /** Session identity only (who is logged in, for guards). Profile screens read `/me` via TanStack Query. */
    user: User | null;
    setTokens: (accessToken: string, refreshToken: string) => void;
    setUser: (user: User) => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            accessToken: null,
            refreshToken: null,
            user: null,
            setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
            setUser: (user) => set({ user }),
            clear: () => set({ accessToken: null, refreshToken: null, user: null }),
        }),
        {
            name: 'mt-auth',
            storage: createJSONStorage(() => localStorage),
            // Only the refresh token survives a reload; the access token lives in memory.
            partialize: (state) => ({ refreshToken: state.refreshToken }),
        },
    ),
);
