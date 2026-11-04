import type { PerformancePoint, SummaryRow, Transaction } from './types';

/**
 * Prisma Decimal columns are serialized as strings. Every numeric field coming from the API
 * passes through here so the rest of the app only ever sees numbers.
 */
export function toNumber(value: unknown): number {
    return typeof value === 'number' ? value : Number(value);
}

export function toNullableNumber(value: unknown): number | null {
    return value === null || value === undefined ? null : toNumber(value);
}

/** `operatedAt` arrives as `2025-01-10T00:00:00.000Z`; keep the calendar date so time zones can't shift it. */
export function toDateOnly(value: string): string {
    return value.slice(0, 10);
}

export function mapTransaction(t: Transaction): Transaction {
    return {
        ...t,
        operatedAt: toDateOnly(t.operatedAt),
        quantity: toNumber(t.quantity),
        pricePerShare: toNumber(t.pricePerShare),
        fees: toNumber(t.fees),
    };
}

export function mapSummaryRow(r: SummaryRow): SummaryRow {
    return {
        ...r,
        position: toNumber(r.position),
        averageCost: toNumber(r.averageCost),
        invested: toNumber(r.invested),
        currentPrice: toNullableNumber(r.currentPrice),
        currentValue: toNullableNumber(r.currentValue),
        gain: toNumber(r.gain),
        gainPct: toNullableNumber(r.gainPct),
        feesInRange: toNumber(r.feesInRange),
    };
}

export function mapPerformancePoint(p: PerformancePoint): PerformancePoint {
    return {
        ...p,
        date: toDateOnly(p.date),
        position: toNumber(p.position),
        value: toNullableNumber(p.value),
        invested: toNumber(p.invested),
        price: toNullableNumber(p.price),
    };
}
