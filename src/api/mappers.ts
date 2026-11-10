import type {
    AssetListItem,
    Debt,
    DebtDetail,
    Expense,
    ExpenseSummary,
    PerformancePoint,
    RecurringPayment,
    SummaryRow,
    Transaction,
} from './types';

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

export function mapAssetListItem(a: AssetListItem): AssetListItem {
    return { ...a, currentPrice: toNullableNumber(a.currentPrice) };
}

export function mapTransaction(t: Transaction): Transaction {
    return {
        ...t,
        operatedAt: toDateOnly(t.operatedAt),
        quantity: toNumber(t.quantity),
        pricePerShare: toNumber(t.pricePerShare),
        fees: toNumber(t.fees),
        iva: toNumber(t.iva),
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
        gain: toNullableNumber(r.gain),
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

export function mapExpense(e: Expense): Expense {
    return { ...e, amount: toNumber(e.amount), spentAt: toDateOnly(e.spentAt) };
}

export function mapRecurring(r: RecurringPayment): RecurringPayment {
    return { ...r, amount: toNumber(r.amount), nextRunAt: toDateOnly(r.nextRunAt) };
}

export function mapDebt(d: Debt): Debt {
    return {
        ...d,
        totalAmount: toNumber(d.totalAmount),
        paidAmount: toNumber(d.paidAmount),
        balance: toNumber(d.balance),
        dueDate: d.dueDate ? toDateOnly(d.dueDate) : null,
    };
}

export function mapDebtDetail(d: DebtDetail): DebtDetail {
    return {
        ...mapDebt(d),
        payments: d.payments.map((p) => ({ ...p, amount: toNumber(p.amount), spentAt: toDateOnly(p.spentAt) })),
    };
}

export function mapExpenseSummary(s: ExpenseSummary): ExpenseSummary {
    return {
        totals: s.totals.map((t) => ({ ...t, total: toNumber(t.total) })),
        byCategory: s.byCategory.map((t) => ({ ...t, total: toNumber(t.total) })),
        byMonth: s.byMonth.map((t) => ({ ...t, total: toNumber(t.total) })),
    };
}
