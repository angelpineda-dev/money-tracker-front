import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assetsApi, summaryApi, type TransactionFilters, transactionsApi } from '@/api/portfolio';
import { type DateRange, queryKeys } from '@/api/queryKeys';
import type { CreateAssetBody, CreateTransactionBody, UpdateAssetBody, UpdateTransactionBody } from '@/api/types';

export function useAssets() {
    return useQuery({ queryKey: queryKeys.assets.list(), queryFn: assetsApi.list });
}

export function useAssetPerformance(id: number, range: DateRange) {
    return useQuery({
        queryKey: queryKeys.assets.performance(id, range),
        queryFn: () => assetsApi.performance(id, range),
        placeholderData: keepPreviousData,
    });
}

export function useSummary(range: DateRange) {
    return useQuery({
        queryKey: queryKeys.summary.range(range),
        queryFn: () => summaryApi.get(range),
        placeholderData: keepPreviousData,
    });
}

export function useTransactions(filters: TransactionFilters) {
    return useQuery({
        queryKey: queryKeys.transactions.list(filters),
        queryFn: () => transactionsApi.list(filters),
        placeholderData: keepPreviousData,
    });
}

/** Anything that changes holdings invalidates every derived view. */
function useInvalidatePortfolio() {
    const qc = useQueryClient();
    return () =>
        Promise.all([
            qc.invalidateQueries({ queryKey: queryKeys.assets.all }),
            qc.invalidateQueries({ queryKey: queryKeys.transactions.all }),
            qc.invalidateQueries({ queryKey: queryKeys.summary.all }),
        ]);
}

export function useSaveAsset() {
    const invalidate = useInvalidatePortfolio();
    return useMutation({
        mutationFn: ({ id, body }: { id?: number; body: CreateAssetBody | UpdateAssetBody }) =>
            id === undefined ? assetsApi.create(body as CreateAssetBody) : assetsApi.update(id, body),
        onSuccess: invalidate,
    });
}

export function useSaveTransaction() {
    const invalidate = useInvalidatePortfolio();
    return useMutation({
        mutationFn: ({ id, body }: { id?: number; body: CreateTransactionBody }) => {
            if (id === undefined) return transactionsApi.create(body);
            const { assetId: _ignored, ...patch } = body;
            return transactionsApi.update(id, patch satisfies UpdateTransactionBody);
        },
        onSuccess: invalidate,
    });
}

export function useDeleteTransaction() {
    const invalidate = useInvalidatePortfolio();
    return useMutation({ mutationFn: transactionsApi.remove, onSuccess: invalidate });
}
