import { beforeEach, describe, expect, it } from 'vitest';
import type { User } from '@/api/types';
import { useAuthStore } from './authStore';

const user: User = { email: 'demo@example.com', name: 'Demo', role: 'USER' };

describe('authStore', () => {
    beforeEach(() => useAuthStore.getState().clear());

    it('stores tokens and user', () => {
        useAuthStore.getState().setTokens('access', 'refresh');
        useAuthStore.getState().setUser(user);
        expect(useAuthStore.getState()).toMatchObject({ accessToken: 'access', refreshToken: 'refresh', user });
    });

    it('persists only the refresh token', () => {
        useAuthStore.getState().setTokens('access', 'refresh');
        useAuthStore.getState().setUser(user);
        const persisted = JSON.parse(localStorage.getItem('mt-auth') ?? '{}');
        expect(persisted.state).toEqual({ refreshToken: 'refresh' });
    });

    it('clear wipes the session', () => {
        useAuthStore.getState().setTokens('access', 'refresh');
        useAuthStore.getState().setUser(user);
        useAuthStore.getState().clear();
        expect(useAuthStore.getState()).toMatchObject({ accessToken: null, refreshToken: null, user: null });
    });
});
