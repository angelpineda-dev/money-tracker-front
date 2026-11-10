/** The two app sections; the URL prefix is the section. */
export const SECTION = {
    INVESTMENTS: 'inversiones',
    EXPENSES: 'gastos',
} as const;

export type Section = (typeof SECTION)[keyof typeof SECTION];

/** Single source of every in-app route; pages, nav and redirects reference these, never string literals. */
export const PATHS = {
    login: '/login',
    register: '/register',
    settings: '/settings',
    admin: '/admin',
    investments: {
        dashboard: `/${SECTION.INVESTMENTS}/dashboard`,
        assets: `/${SECTION.INVESTMENTS}/assets`,
        asset: (id: number | string) => `/${SECTION.INVESTMENTS}/assets/${id}`,
        transactions: `/${SECTION.INVESTMENTS}/transactions`,
    },
    expenses: {
        summary: `/${SECTION.EXPENSES}/resumen`,
        list: `/${SECTION.EXPENSES}/movimientos`,
        income: `/${SECTION.EXPENSES}/ingresos`,
        recurring: `/${SECTION.EXPENSES}/recurrentes`,
        debts: `/${SECTION.EXPENSES}/deudas`,
        debt: (id: number | string) => `/${SECTION.EXPENSES}/deudas/${id}`,
        categories: `/${SECTION.EXPENSES}/categorias`,
    },
} as const;

/** Landing page of the app and of each section. */
export const HOME = PATHS.investments.dashboard;
export const SECTION_HOME: Record<Section, string> = {
    [SECTION.INVESTMENTS]: PATHS.investments.dashboard,
    [SECTION.EXPENSES]: PATHS.expenses.summary,
};

/** Section a pathname belongs to; global pages (settings, admin) fall back to investments. */
export function sectionOf(pathname: string): Section {
    return pathname.startsWith(`/${SECTION.EXPENSES}`) ? SECTION.EXPENSES : SECTION.INVESTMENTS;
}
