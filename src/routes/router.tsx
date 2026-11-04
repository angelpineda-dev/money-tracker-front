import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { ADMIN_ROLES } from '@/api/types';
import { SplashScreen } from '@/components/SplashScreen';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicOnly, RequireAuth, RequireRole } from './guards';

type PageModule = { default: React.ComponentType };
const page = (load: () => Promise<PageModule>) => async () => ({ Component: (await load()).default });

export const routes: RouteObject[] = [
    {
        HydrateFallback: SplashScreen,
        children: [
            {
                element: <PublicOnly />,
                children: [
                    {
                        element: <AuthLayout />,
                        children: [
                            { path: '/login', lazy: page(() => import('@/pages/LoginPage')) },
                            { path: '/register', lazy: page(() => import('@/pages/RegisterPage')) },
                        ],
                    },
                ],
            },
            {
                element: <RequireAuth />,
                children: [
                    {
                        element: <AppLayout />,
                        children: [
                            { index: true, element: <Navigate to="/dashboard" replace /> },
                            { path: '/dashboard', lazy: page(() => import('@/pages/DashboardPage')) },
                            { path: '/assets', lazy: page(() => import('@/pages/AssetsPage')) },
                            { path: '/assets/:id', lazy: page(() => import('@/pages/AssetDetailPage')) },
                            { path: '/transactions', lazy: page(() => import('@/pages/TransactionsPage')) },
                            { path: '/settings', lazy: page(() => import('@/pages/SettingsPage')) },
                            {
                                element: <RequireRole roles={ADMIN_ROLES} />,
                                children: [{ path: '/admin', lazy: page(() => import('@/pages/AdminPage')) }],
                            },
                        ],
                    },
                ],
            },
            { path: '*', lazy: page(() => import('@/pages/NotFoundPage')) },
        ],
    },
];

export const router = createBrowserRouter(routes);
