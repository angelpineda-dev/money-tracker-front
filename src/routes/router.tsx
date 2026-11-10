import { createBrowserRouter, Navigate, type RouteObject, redirect } from 'react-router';
import { ADMIN_ROLES } from '@/api/types';
import { SplashScreen } from '@/components/SplashScreen';
import { AppLayout } from '@/layouts/AppLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PublicOnly, RequireAuth, RequireRole } from './guards';
import { HOME, PATHS } from './paths';

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
                            { index: true, element: <Navigate to={HOME} replace /> },
                            // Investments section
                            { path: PATHS.investments.dashboard, lazy: page(() => import('@/pages/DashboardPage')) },
                            { path: PATHS.investments.assets, lazy: page(() => import('@/pages/AssetsPage')) },
                            {
                                path: PATHS.investments.asset(':id'),
                                lazy: page(() => import('@/pages/AssetDetailPage')),
                            },
                            {
                                path: PATHS.investments.transactions,
                                lazy: page(() => import('@/pages/TransactionsPage')),
                            },
                            // Expenses section
                            { path: PATHS.expenses.summary, lazy: page(() => import('@/pages/ExpensesSummaryPage')) },
                            { path: PATHS.expenses.list, lazy: page(() => import('@/pages/ExpensesPage')) },
                            { path: PATHS.expenses.recurring, lazy: page(() => import('@/pages/RecurringPage')) },
                            { path: PATHS.expenses.debts, lazy: page(() => import('@/pages/DebtsPage')) },
                            { path: PATHS.expenses.debt(':id'), lazy: page(() => import('@/pages/DebtDetailPage')) },
                            { path: PATHS.expenses.categories, lazy: page(() => import('@/pages/CategoriesPage')) },
                            // Pre-sections URLs (bookmarks)
                            { path: '/dashboard', element: <Navigate to={PATHS.investments.dashboard} replace /> },
                            { path: '/assets', element: <Navigate to={PATHS.investments.assets} replace /> },
                            {
                                path: '/assets/:id',
                                loader: ({ params }) => redirect(PATHS.investments.asset(params.id ?? '')),
                            },
                            {
                                path: '/transactions',
                                element: <Navigate to={PATHS.investments.transactions} replace />,
                            },
                            { path: PATHS.settings, lazy: page(() => import('@/pages/SettingsPage')) },
                            {
                                element: <RequireRole roles={ADMIN_ROLES} />,
                                children: [{ path: PATHS.admin, lazy: page(() => import('@/pages/AdminPage')) }],
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
