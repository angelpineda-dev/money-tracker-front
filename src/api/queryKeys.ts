export const queryKeys = {
    me: ['me'] as const,
    assets: {
        all: ['assets'] as const,
        list: () => [...queryKeys.assets.all, 'list'] as const,
        performance: (id: number, range: { from?: string; to?: string }) =>
            [...queryKeys.assets.all, 'performance', id, range] as const,
    },
    transactions: {
        all: ['transactions'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.transactions.all, 'list', filters] as const,
    },
    summary: (range: { from?: string; to?: string }) => ['summary', range] as const,
};
