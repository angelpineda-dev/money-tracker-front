import type { components, paths } from './schema';

type Schemas = components['schemas'];

/** Schemas in the contract mark every field optional; the API always returns them. */
export type User = Required<Schemas['User']>;
export type Role = User['role'];
export type Asset = Required<Schemas['Asset']>;
export type Currency = Asset['currency'];
/** Row of `GET /api/assets`: the asset plus its cached price (null until prices are refreshed). */
export type AssetListItem = Required<Schemas['AssetWithPrice']>;
export type TransactionType = Required<Schemas['Transaction']>['type'];
export type Transaction = Omit<Required<Schemas['Transaction']>, 'asset'> & {
    asset: { symbol: string; currency: Currency };
};
export type SummaryRow = Omit<Required<Schemas['SummaryRow']>, 'asset'> & { asset: Asset };
export type ExpenseCategory = Required<Schemas['ExpenseCategory']>;
export type Expense = Omit<Required<Schemas['Expense']>, 'category' | 'debt'> & {
    category: { id: number; name: string; color: string | null };
    debt: { id: number; name: string } | null;
};
export type Income = Required<Schemas['Income']>;
export type CashflowMonth = Required<Schemas['CashflowMonth']>;
export type RecurringPayment = Omit<Required<Schemas['RecurringPayment']>, 'category'> & {
    category: { id: number; name: string; color: string | null };
};
export type RecurrenceFrequency = Required<Schemas['RecurringPayment']>['frequency'];
export type Debt = Required<Schemas['Debt']>;
export type DebtPayment = Required<Schemas['DebtPayment']>;
export type DebtDetail = Debt & { payments: DebtPayment[] };
type ExpenseSummarySchema = Required<Schemas['ExpenseSummary']>;
export type ExpenseSummary = {
    totals: Required<ExpenseSummarySchema['totals'][number]>[];
    byCategory: Required<ExpenseSummarySchema['byCategory'][number]>[];
    byMonth: Required<ExpenseSummarySchema['byMonth'][number]>[];
};
export type PerformancePoint = Required<Schemas['PerformancePoint']>;
export type SymbolMatch = Required<Schemas['SymbolMatch']>;

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
export type CreateCategoryBody = JsonBody<'/api/expense-categories', 'post'>;
export type UpdateCategoryBody = JsonBody<'/api/expense-categories/{id}', 'patch'>;
export type CreateExpenseBody = JsonBody<'/api/expenses', 'post'>;
export type UpdateExpenseBody = JsonBody<'/api/expenses/{id}', 'patch'>;
export type CreateIncomeBody = JsonBody<'/api/income', 'post'>;
export type UpdateIncomeBody = JsonBody<'/api/income/{id}', 'patch'>;
export type CreateRecurringBody = JsonBody<'/api/recurring-payments', 'post'>;
export type UpdateRecurringBody = JsonBody<'/api/recurring-payments/{id}', 'patch'>;
export type CreateDebtBody = JsonBody<'/api/debts', 'post'>;
export type UpdateDebtBody = JsonBody<'/api/debts/{id}', 'patch'>;

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

/** Runtime lists, typed against the generated enums so they break if the contract changes. */
export const CURRENCIES = ['MXN', 'USD'] as const satisfies readonly Currency[];
export const FREQUENCIES = ['WEEKLY', 'MONTHLY', 'YEARLY'] as const satisfies readonly RecurrenceFrequency[];
