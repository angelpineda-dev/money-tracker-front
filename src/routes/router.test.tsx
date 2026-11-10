import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { SnackbarProvider } from 'notistack';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '@/lib/dayjs';
import { useAuthStore } from '@/stores/authStore';
import { API, server } from '@/test/server';
import { PATHS } from './paths';
import { routes } from './router';

function renderAt(path: string) {
    useAuthStore.getState().setTokens('access', 'refresh');
    useAuthStore.getState().setUser({ email: 'demo@example.com', name: 'Demo', role: 'USER' });
    const router = createMemoryRouter(routes, { initialEntries: [path] });
    // Landing pages fetch on mount; an empty API is enough to reach the navigation.
    server.use(http.get(`${API}/api/*`, () => HttpResponse.json({ success: true, data: [] })));
    render(
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <SnackbarProvider>
                    <RouterProvider router={router} />
                </SnackbarProvider>
            </LocalizationProvider>
        </QueryClientProvider>,
    );
    return router;
}

describe('legacy URL redirects', () => {
    beforeEach(() => {
        useAuthStore.getState().clear();
        // jsdom has no matchMedia: pretend a desktop viewport so the permanent drawer renders.
        vi.stubGlobal('matchMedia', (query: string) => ({
            matches: true,
            media: query,
            addEventListener: () => {},
            removeEventListener: () => {},
        }));
    });
    afterEach(() => vi.unstubAllGlobals());

    it.each([
        ['/', PATHS.investments.dashboard],
        ['/dashboard', PATHS.investments.dashboard],
        ['/assets', PATHS.investments.assets],
        ['/assets/7', PATHS.investments.asset(7)],
        ['/transactions', PATHS.investments.transactions],
    ])('%s -> %s', async (from, to) => {
        const router = renderAt(from);
        await waitFor(() => expect(router.state.location.pathname).toBe(to));
    });

    it('shows the expenses nav inside /gastos', async () => {
        renderAt(PATHS.expenses.categories);
        expect(await screen.findByRole('link', { name: 'Deudas' })).toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Activos' })).not.toBeInTheDocument();
    });
});
