import { QueryClient } from '@tanstack/react-query';
import { toApiError } from '@/api/errors';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
                const { status } = toApiError(error);
                // Do not retry client errors (401 is already handled by the axios interceptor).
                if (status >= 400 && status < 500) return false;
                return failureCount < 2;
            },
        },
    },
});
