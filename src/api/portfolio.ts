import { api, unwrap } from './client';
import { mapPerformancePoint, mapSummaryRow, mapTransaction } from './mappers';
import type { DateRange } from './queryKeys';
import type {
    Asset,
    CreateAssetBody,
    CreateTransactionBody,
    PerformancePoint,
    SummaryRow,
    Transaction,
    TransactionType,
    UpdateAssetBody,
    UpdateTransactionBody,
} from './types';

export interface TransactionFilters extends DateRange {
    assetId?: number;
    type?: TransactionType;
}

/** Drops empty values so they never reach the query string. */
function params<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')) as Partial<T>;
}

export const assetsApi = {
    list: () => unwrap<Asset[]>(api.get('/api/assets')),
    create: (body: CreateAssetBody) => unwrap<Asset>(api.post('/api/assets', body)),
    update: (id: number, body: UpdateAssetBody) => unwrap<Asset>(api.patch(`/api/assets/${id}`, body)),
    performance: async (id: number, range: DateRange) =>
        (await unwrap<PerformancePoint[]>(api.get(`/api/assets/${id}/performance`, { params: params(range) }))).map(
            mapPerformancePoint,
        ),
};

export const transactionsApi = {
    list: async (filters: TransactionFilters) =>
        (await unwrap<Transaction[]>(api.get('/api/transactions', { params: params(filters) }))).map(mapTransaction),
    create: async (body: CreateTransactionBody) =>
        mapTransaction(await unwrap<Transaction>(api.post('/api/transactions', body))),
    update: async (id: number, body: UpdateTransactionBody) =>
        mapTransaction(await unwrap<Transaction>(api.patch(`/api/transactions/${id}`, body))),
    remove: (id: number) => unwrap<undefined>(api.delete(`/api/transactions/${id}`)),
};

export const summaryApi = {
    get: async (range: DateRange) =>
        (await unwrap<SummaryRow[]>(api.get('/api/summary', { params: params(range) }))).map(mapSummaryRow),
};

export const pricesApi = {
    refresh: () => unwrap<{ updated: number }>(api.post('/api/prices/refresh')),
};
