import type { Currency, SummaryRow } from '@/api/types';

export interface CurrencyTotals {
    currency: Currency;
    invested: number;
    currentValue: number;
    gain: number;
    fees: number;
    /** True when some open position has no cached price, so `currentValue` is a lower bound. */
    missingPrices: boolean;
}

/** Groups by currency. MXN and USD are never added together. */
export function totalsByCurrency(rows: SummaryRow[]): CurrencyTotals[] {
    const map = new Map<Currency, CurrencyTotals>();
    for (const row of rows) {
        const currency = row.asset.currency;
        const t = map.get(currency) ?? {
            currency,
            invested: 0,
            currentValue: 0,
            gain: 0,
            fees: 0,
            missingPrices: false,
        };
        t.invested += row.invested;
        t.currentValue += row.currentValue ?? 0;
        t.gain += row.gain;
        t.fees += row.feesInRange;
        if (row.position > 0 && row.currentValue === null) t.missingPrices = true;
        map.set(currency, t);
    }
    return [...map.values()].sort((a, b) => a.currency.localeCompare(b.currency));
}
