import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { ADMIN_ROLES, type User } from '@/api/types';
import { useAuthStore } from '@/stores/authStore';
import { PublicOnly, RequireAuth, RequireRole } from './guards';
import { HOME } from './paths';

function renderAt(path: string) {
    const router = createMemoryRouter(
        [
            { element: <PublicOnly />, children: [{ path: '/login', element: <p>login page</p> }] },
            {
                element: <RequireAuth />,
                children: [
                    { path: HOME, element: <p>dashboard page</p> },
                    {
                        element: <RequireRole roles={ADMIN_ROLES} />,
                        children: [{ path: '/admin', element: <p>admin page</p> }],
                    },
                ],
            },
        ],
        { initialEntries: [path] },
    );
    render(<RouterProvider router={router} />);
    return router;
}

function loginAs(role: User['role']) {
    useAuthStore.getState().setTokens('access', 'refresh');
    useAuthStore.getState().setUser({ email: 'demo@example.com', name: 'Demo', role });
}

describe('route guards', () => {
    beforeEach(() => useAuthStore.getState().clear());

    it('redirects anonymous users to /login', async () => {
        const router = renderAt(HOME);
        expect(await screen.findByText('login page')).toBeInTheDocument();
        expect(router.state.location.pathname).toBe('/login');
    });

    it('redirects logged-in users away from /login', async () => {
        loginAs('USER');
        renderAt('/login');
        expect(await screen.findByText('dashboard page')).toBeInTheDocument();
    });

    it('blocks /admin for USER', async () => {
        loginAs('USER');
        renderAt('/admin');
        expect(await screen.findByText('dashboard page')).toBeInTheDocument();
    });

    it('allows /admin for ADMIN', async () => {
        loginAs('ADMIN');
        renderAt('/admin');
        expect(await screen.findByText('admin page')).toBeInTheDocument();
    });
});
