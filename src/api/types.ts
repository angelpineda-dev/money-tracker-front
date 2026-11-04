import type { components, paths } from './schema';

type Schemas = components['schemas'];

/** Schemas in the contract mark every field optional; the API always returns them. */
export type User = Required<Schemas['User']>;
export type Role = User['role'];
export type Asset = Required<Schemas['Asset']>;
export type Currency = Asset['currency'];
export type Transaction = Required<Schemas['Transaction']>;
export type TransactionType = Transaction['type'];
export type SummaryRow = Required<Schemas['SummaryRow']>;
export type PerformancePoint = Required<Schemas['PerformancePoint']>;

type JsonBody<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
    requestBody?: { content: { 'application/json': infer B } };
}
    ? B
    : never;

export type LoginBody = JsonBody<'/api/auth/login', 'post'>;
export type RegisterBody = JsonBody<'/api/auth/register', 'post'>;
export type UpdateProfileBody = JsonBody<'/api/user/me', 'patch'>;
export type ChangePasswordBody = JsonBody<'/api/user/me/password', 'patch'>;
export type CreateAssetBody = JsonBody<'/api/assets', 'post'>;
export type UpdateAssetBody = JsonBody<'/api/assets/{id}', 'patch'>;
export type CreateTransactionBody = JsonBody<'/api/transactions', 'post'>;
export type UpdateTransactionBody = JsonBody<'/api/transactions/{id}', 'patch'>;

export interface TokenPair {
    token: string;
    refreshToken: string;
}

export interface ApiEnvelope<T> {
    success: boolean;
    data?: T;
    message?: string;
}

/** Runtime role list, typed against the generated enum so it breaks if the contract changes. */
export const ROLES = ['SUPER_ADMIN', 'ADMIN', 'USER'] as const satisfies readonly Role[];
export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const satisfies readonly Role[];
