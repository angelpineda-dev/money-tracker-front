import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import RegisterPage from './RegisterPage';

function renderPage() {
    const router = createMemoryRouter([{ path: '/register', element: <RegisterPage /> }], {
        initialEntries: ['/register'],
    });
    render(
        <QueryClientProvider client={new QueryClient()}>
            <RouterProvider router={router} />
        </QueryClientProvider>,
    );
}

describe('RegisterPage validation', () => {
    it('shows field errors and does not call the API', async () => {
        const user = userEvent.setup();
        renderPage();

        await user.type(screen.getByLabelText(/^Nombre/), 'A');
        await user.type(screen.getByLabelText(/^Correo/), 'no-es-correo');
        await user.type(screen.getByLabelText(/^Contraseña/), 'password1');
        await user.type(screen.getByLabelText(/^Confirmar contraseña/), 'Password1');
        await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));

        expect(await screen.findByText('Mínimo 2 caracteres')).toBeInTheDocument();
        expect(screen.getByText('Correo inválido')).toBeInTheDocument();
        expect(screen.getByText('Debe incluir una mayúscula')).toBeInTheDocument();
        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
        // MSW is set to error on unhandled requests, so any API call would fail this test.
    });
});
