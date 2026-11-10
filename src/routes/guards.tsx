import { Navigate, Outlet, useLocation } from 'react-router';
import type { Role } from '@/api/types';
import { useAuthStore } from '@/stores/authStore';
import { HOME } from './paths';

function useIsAuthenticated() {
    return useAuthStore((s) => Boolean(s.accessToken && s.user));
}

export function RequireAuth() {
    const authenticated = useIsAuthenticated();
    const location = useLocation();
    if (!authenticated) return <Navigate to="/login" replace state={{ from: location }} />;
    return <Outlet />;
}

export function RequireRole({ roles }: { roles: readonly Role[] }) {
    const role = useAuthStore((s) => s.user?.role);
    if (!role || !roles.includes(role)) return <Navigate to={HOME} replace />;
    return <Outlet />;
}

export function PublicOnly() {
    const authenticated = useIsAuthenticated();
    const location = useLocation();
    if (authenticated) {
        const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
        return <Navigate to={from ?? HOME} replace />;
    }
    return <Outlet />;
}
