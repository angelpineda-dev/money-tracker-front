import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { queryClient } from '@/app/queryClient';
import { useAuthStore } from '@/stores/authStore';
import type { ApiEnvelope, TokenPair } from './types';

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const config = { baseURL: API_URL, adapter: 'fetch', headers: { 'Content-Type': 'application/json' } } as const;

export const api = axios.create(config);

/** Bare instance for /refresh so it never goes through the 401 interceptor. */
const refreshClient = axios.create(config);

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
});

let refreshPromise: Promise<string> | null = null;

/**
 * Single-flight refresh. The backend rotates the refresh token, so two concurrent refreshes
 * would invalidate each other; every caller shares the same in-flight promise.
 */
export function refreshSession(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (!refreshToken) throw new Error('No refresh token');
            const { data } = await refreshClient.post<ApiEnvelope<TokenPair>>('/api/auth/refresh', { refreshToken });
            if (!data.data) throw new Error('Respuesta de refresh inválida');
            useAuthStore.getState().setTokens(data.data.token, data.data.refreshToken);
            return data.data.token;
        })().finally(() => {
            refreshPromise = null;
        });
    }
    return refreshPromise;
}

export function endSession(redirect = true): void {
    useAuthStore.getState().clear();
    queryClient.clear();
    if (redirect && window.location.pathname !== '/login') window.location.assign('/login');
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(undefined, async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const isAuthEndpoint = original?.url?.startsWith('/api/auth/') ?? false;
    if (error.response?.status !== 401 || !original || original._retried || isAuthEndpoint) {
        throw error;
    }
    original._retried = true;
    let token: string;
    try {
        token = await refreshSession();
    } catch {
        endSession();
        throw error;
    }
    original.headers.set('Authorization', `Bearer ${token}`);
    return api(original);
});

/** Unwraps `{ success, data }`. Errors propagate as AxiosError; use `toApiError` to read them. */
export async function unwrap<T>(request: Promise<{ data: ApiEnvelope<T> }>): Promise<T> {
    const { data } = await request;
    return data.data as T;
}
