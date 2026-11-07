import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { assetsApi } from '@/api/portfolio';
import { queryKeys } from '@/api/queryKeys';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const SYMBOL_SEARCH_MIN_CHARS = 2;
const DEBOUNCE_MS = 350;

/**
 * Yahoo symbol lookup for the asset form. Debounced and cached because every keystroke would
 * otherwise spend the backend's shared rate-limit budget (100 requests / 15 min).
 */
export function useSymbolSearch(input: string, enabled: boolean) {
    const q = useDebouncedValue(input.trim(), DEBOUNCE_MS);
    const active = enabled && q.length >= SYMBOL_SEARCH_MIN_CHARS;
    const query = useQuery({
        queryKey: queryKeys.symbolSearch(q.toUpperCase()),
        queryFn: () => assetsApi.search(q),
        enabled: active,
        staleTime: 10 * 60 * 1000,
        retry: false,
        placeholderData: keepPreviousData,
    });
    return { ...query, active, pending: active && (query.isFetching || q !== input.trim()) };
}
