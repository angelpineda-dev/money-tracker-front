import { isAxiosError } from 'axios';

export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

const FALLBACK = 'Ocurrió un error inesperado. Intenta de nuevo.';

export function toApiError(error: unknown): ApiError {
    if (error instanceof ApiError) return error;
    if (isAxiosError<{ message?: string }>(error)) {
        if (!error.response) return new ApiError(0, 'No se pudo conectar con el servidor.');
        return new ApiError(error.response.status, error.response.data?.message ?? FALLBACK);
    }
    return new ApiError(0, error instanceof Error ? error.message : FALLBACK);
}

/**
 * True only when the server rejected the credential itself (401/403). A 429, a 5xx or a network
 * failure says nothing about the session, so callers must not drop it for those.
 */
export function isSessionRejected(error: unknown): boolean {
    const { status } = toApiError(error);
    return status === 401 || status === 403;
}

export function errorMessage(error: unknown): string {
    return toApiError(error).message;
}
