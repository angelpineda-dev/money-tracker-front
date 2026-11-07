export type DateRange = { from?: string; to?: string };

export const queryKeys = {
    me: ['me'] as const,
    assets: {
        all: ['assets'] as const,
        list: () => ['assets', 'list'] as const,
        performance: (id: number, range: DateRange) => ['assets', 'performance', id, range] as const,
    },
    /** Outside `assets` on purpose: saving an asset invalidates `assets.all`, which must not re-run searches. */
    symbolSearch: (q: string) => ['symbol-search', q] as const,
    transactions: {
        all: ['transactions'] as const,
        list: (filters: object) => ['transactions', 'list', filters] as const,
    },
    summary: {
        all: ['summary'] as const,
        range: (range: DateRange) => ['summary', range] as const,
    },
};
