import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/stores/authStore';
import { API, server } from '@/test/server';
import { AuthBootstrap } from './AuthBootstrap';

const USER = { email: 'demo@example.com', name: 'Demo', role: 'USER' };
const tokens = { token: 'fresh', refreshToken: 'refresh-2' };

const refreshOk = http.post(`${API}/api/auth/refresh`, () => HttpResponse.json({ success: true, data: tokens }));
const meOk = http.get(`${API}/api/user/me`, () => HttpResponse.json({ success: true, data: USER }));

function renderBootstrap() {
    render(
        <AuthBootstrap>
            <p>app lista</p>
        </AuthBootstrap>,
    );
}

describe('AuthBootstrap', () => {
    beforeEach(() => {
        useAuthStore.getState().clear();
        useAuthStore.getState().setTokens('stale', 'refresh-1');
    });

    it('renders the app once the session is restored', async () => {
        server.use(refreshOk, meOk);
        renderBootstrap();

        expect(await screen.findByText('app lista')).toBeInTheDocument();
        expect(useAuthStore.getState()).toMatchObject({ refreshToken: 'refresh-2', user: USER });
    });

    it('keeps the session and offers a retry when the refresh is rate limited', async () => {
        const user = userEvent.setup();
        let limited = true;
        server.use(
            http.post(`${API}/api/auth/refresh`, () =>
                limited
                    ? HttpResponse.json({ success: false, message: 'Too many requests' }, { status: 429 })
                    : HttpResponse.json({ success: true, data: tokens }),
            ),
            meOk,
        );
        renderBootstrap();

        expect(await screen.findByText('Too many requests')).toBeInTheDocument();
        expect(screen.queryByText('app lista')).not.toBeInTheDocument();
        expect(useAuthStore.getState().refreshToken).toBe('refresh-1');

        limited = false;
        await user.click(screen.getByRole('button', { name: 'Reintentar' }));

        expect(await screen.findByText('app lista')).toBeInTheDocument();
        expect(useAuthStore.getState().refreshToken).toBe('refresh-2');
    });

    it('keeps the session when loading the profile fails with a server error', async () => {
        server.use(
            refreshOk,
            http.get(`${API}/api/user/me`, () =>
                HttpResponse.json({ success: false, message: 'Servicio no disponible' }, { status: 503 }),
            ),
        );
        renderBootstrap();

        expect(await screen.findByText('Servicio no disponible')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
        expect(useAuthStore.getState().refreshToken).toBe('refresh-2');
    });

    it('drops the session when the server rejects the refresh token', async () => {
        server.use(http.post(`${API}/api/auth/refresh`, () => HttpResponse.json({ success: false }, { status: 401 })));
        renderBootstrap();

        expect(await screen.findByText('app lista')).toBeInTheDocument();
        expect(useAuthStore.getState()).toMatchObject({ accessToken: null, refreshToken: null, user: null });
    });
});
