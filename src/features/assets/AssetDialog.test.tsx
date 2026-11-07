import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { SnackbarProvider } from 'notistack';
import { describe, expect, it, vi } from 'vitest';
import type { SymbolMatch } from '@/api/types';
import { API, server } from '@/test/server';
import { AssetDialog } from './AssetDialog';

const CUERVO: SymbolMatch = {
    symbol: 'CUERVO.MX',
    name: 'Becle, S.A.B. de C.V.',
    currency: 'MXN',
    exchange: 'Mexico',
    type: 'EQUITY',
};
const AAPL: SymbolMatch = { symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD', exchange: 'NASDAQ', type: 'EQUITY' };

function renderDialog() {
    const onClose = vi.fn();
    render(
        <QueryClientProvider client={new QueryClient()}>
            <SnackbarProvider>
                <AssetDialog open asset={null} onClose={onClose} />
            </SnackbarProvider>
        </QueryClientProvider>,
    );
    return { onClose };
}

describe('AssetDialog symbol search', () => {
    it('fills symbol, name and currency from a search result and locks the currency', async () => {
        const searched: string[] = [];
        let posted: unknown;
        server.use(
            http.get(`${API}/api/assets/search`, ({ request }) => {
                searched.push(new URL(request.url).searchParams.get('q') ?? '');
                return HttpResponse.json({ success: true, data: [AAPL] });
            }),
            http.post(`${API}/api/assets`, async ({ request }) => {
                posted = await request.json();
                return HttpResponse.json({ success: true, data: { id: 1, ...(posted as object) } }, { status: 201 });
            }),
            http.get(`${API}/api/assets`, () => HttpResponse.json({ success: true, data: [] })),
            http.get(`${API}/api/summary`, () => HttpResponse.json({ success: true, data: [] })),
            http.get(`${API}/api/transactions`, () => HttpResponse.json({ success: true, data: [] })),
        );
        const user = userEvent.setup();
        const { onClose } = renderDialog();

        await user.type(screen.getByRole('combobox', { name: 'Símbolo' }), 'apple');
        await user.click(await screen.findByText('AAPL', {}, { timeout: 2000 }));

        expect(screen.getByRole('combobox', { name: 'Símbolo' })).toHaveValue('AAPL');
        expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveValue('Apple Inc.');
        expect(screen.getByRole('combobox', { name: 'Moneda' })).toHaveAttribute('aria-disabled', 'true');
        expect(screen.getByText('Detectada desde Yahoo Finance')).toBeInTheDocument();
        // Debounced: one request for the whole word, not one per keystroke.
        expect(searched).toEqual(['apple']);

        await user.click(screen.getByRole('button', { name: 'Guardar' }));
        await waitFor(() => expect(onClose).toHaveBeenCalled());
        expect(posted).toEqual({ symbol: 'AAPL', name: 'Apple Inc.', currency: 'USD' });
    });

    it('keeps manual entry working when the search is unavailable', async () => {
        let posted: unknown;
        server.use(
            http.get(`${API}/api/assets/search`, () =>
                HttpResponse.json({ success: false, message: 'Búsqueda no disponible' }, { status: 503 }),
            ),
            http.post(`${API}/api/assets`, async ({ request }) => {
                posted = await request.json();
                return HttpResponse.json({ success: true, data: { id: 2, ...(posted as object) } }, { status: 201 });
            }),
            http.get(`${API}/api/assets`, () => HttpResponse.json({ success: true, data: [] })),
            http.get(`${API}/api/summary`, () => HttpResponse.json({ success: true, data: [] })),
            http.get(`${API}/api/transactions`, () => HttpResponse.json({ success: true, data: [] })),
        );
        const user = userEvent.setup();
        renderDialog();

        await user.type(screen.getByRole('combobox', { name: 'Símbolo' }), 'cuervo.mx');
        expect(await screen.findByText('Búsqueda no disponible', {}, { timeout: 2000 })).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Nombre' }), CUERVO.name);
        await user.click(screen.getByRole('button', { name: 'Guardar' }));

        await waitFor(() => expect(posted).toEqual({ symbol: 'CUERVO.MX', name: CUERVO.name, currency: 'MXN' }));
    });
});
