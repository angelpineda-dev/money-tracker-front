import { delay, HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { API, server } from '@/test/server';
import { api, unwrap } from './client';

describe('axios refresh interceptor', () => {
    beforeEach(() => {
        useAuthStore.getState().clear();
        useAuthStore.getState().setTokens('expired', 'refresh-1');
    });

    it('runs a single refresh for parallel 401s and retries both requests', async () => {
        let refreshCalls = 0;
        server.use(
            http.get(`${API}/api/assets`, ({ request }) =>
                request.headers.get('Authorization') === 'Bearer fresh'
                    ? HttpResponse.json({ success: true, data: [] })
                    : HttpResponse.json({ success: false, message: 'Token expirado' }, { status: 401 }),
            ),
            http.post(`${API}/api/auth/refresh`, async ({ request }) => {
                refreshCalls++;
                const body = (await request.json()) as { refreshToken: string };
                await delay(20);
                if (body.refreshToken !== 'refresh-1') return HttpResponse.json({ success: false }, { status: 401 });
                return HttpResponse.json({ success: true, data: { token: 'fresh', refreshToken: 'refresh-2' } });
            }),
        );

        const results = await Promise.all([unwrap(api.get('/api/assets')), unwrap(api.get('/api/assets'))]);

        expect(results).toEqual([[], []]);
        expect(refreshCalls).toBe(1);
        expect(useAuthStore.getState()).toMatchObject({ accessToken: 'fresh', refreshToken: 'refresh-2' });
    });

    it('clears the session when the refresh fails', async () => {
        window.history.pushState({}, '', '/login');
        server.use(
            http.get(`${API}/api/assets`, () => HttpResponse.json({ success: false }, { status: 401 })),
            http.post(`${API}/api/auth/refresh`, () => HttpResponse.json({ success: false }, { status: 401 })),
        );

        await expect(api.get('/api/assets')).rejects.toMatchObject({ response: { status: 401 } });
        expect(useAuthStore.getState()).toMatchObject({ accessToken: null, refreshToken: null, user: null });
    });

    it('keeps the session when the refresh is rate limited', async () => {
        server.use(
            http.get(`${API}/api/assets`, () => HttpResponse.json({ success: false }, { status: 401 })),
            http.post(`${API}/api/auth/refresh`, () =>
                HttpResponse.json({ success: false, message: 'Too many requests' }, { status: 429 }),
            ),
        );

        await expect(api.get('/api/assets')).rejects.toMatchObject({ response: { status: 429 } });
        expect(useAuthStore.getState()).toMatchObject({ accessToken: 'expired', refreshToken: 'refresh-1' });
    });

    it('clears the session when there is no refresh token to use', async () => {
        window.history.pushState({}, '', '/login');
        useAuthStore.getState().clear();
        server.use(http.get(`${API}/api/assets`, () => HttpResponse.json({ success: false }, { status: 401 })));

        await expect(api.get('/api/assets')).rejects.toMatchObject({ response: { status: 401 } });
        expect(useAuthStore.getState()).toMatchObject({ accessToken: null, refreshToken: null });
    });

    it('does not try to refresh on auth endpoints', async () => {
        let refreshCalls = 0;
        server.use(
            http.post(`${API}/api/auth/login`, () =>
                HttpResponse.json({ success: false, message: 'Credenciales inválidas' }, { status: 401 }),
            ),
            http.post(`${API}/api/auth/refresh`, () => {
                refreshCalls++;
                return HttpResponse.json({ success: false }, { status: 401 });
            }),
        );

        await expect(api.post('/api/auth/login', {})).rejects.toMatchObject({ response: { status: 401 } });
        expect(refreshCalls).toBe(0);
    });
});
