import type { Currency, SummaryRow } from '@/api/types';

export interface CurrencyTotals {
    currency: Currency;
    invested: number;
    /** null when positions are open but none has a cached price: the value is unknown, not zero. */
    currentValue: number | null;
    /** null when any asset's gain is unknown (missing price): a partial sum would be misleading. */
    gain: number | null;
    fees: number;
    /** True when some open position has no cached price, so `currentValue` is a lower bound. */
    missingPrices: boolean;
}

/** An asset with no transactions has nothing to report; it is kept out of totals, table and chart. */
export function splitTraded(rows: SummaryRow[]): { traded: SummaryRow[]; untraded: SummaryRow[] } {
    const traded: SummaryRow[] = [];
    const untraded: SummaryRow[] = [];
    for (const row of rows) (row.firstTransactionDate === null ? untraded : traded).push(row);
    return { traded, untraded };
}

/** Groups by currency. MXN and USD are never added together. */
export function totalsByCurrency(rows: SummaryRow[]): CurrencyTotals[] {
    const map = new Map<Currency, CurrencyTotals & { openPositions: number; pricedPositions: number }>();
    for (const row of rows) {
        const currency = row.asset.currency;
        const t = map.get(currency) ?? {
            currency,
            invested: 0,
            currentValue: 0,
            gain: 0,
            fees: 0,
            missingPrices: false,
            openPositions: 0,
            pricedPositions: 0,
        };
        t.invested += row.invested;
        t.currentValue = (t.currentValue ?? 0) + (row.currentValue ?? 0);
        t.gain = t.gain === null || row.gain === null ? null : t.gain + row.gain;
        t.fees += row.feesInRange;
        if (row.position > 0) {
            t.openPositions += 1;
            if (row.currentValue === null) t.missingPrices = true;
            else t.pricedPositions += 1;
        }
        map.set(currency, t);
    }
    return [...map.values()]
        .map(({ openPositions, pricedPositions, ...t }) => ({
            ...t,
            currentValue: openPositions > 0 && pricedPositions === 0 ? null : t.currentValue,
        }))
        .sort((a, b) => a.currency.localeCompare(b.currency));
}
