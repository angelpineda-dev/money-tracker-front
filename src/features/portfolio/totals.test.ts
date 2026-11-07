import { describe, expect, it } from 'vitest';
import type { SummaryRow } from '@/api/types';
import { splitTraded, totalsByCurrency } from './totals';

const row = (currency: 'MXN' | 'USD', invested: number, value: number | null, gain: number | null, position = 1) =>
    ({
        asset: { id: 1, symbol: 'X', name: 'X', currency },
        position,
        invested,
        currentValue: value,
        gain,
        feesInRange: 1,
        firstTransactionDate: '2026-01-01',
    }) as SummaryRow;

describe('totalsByCurrency', () => {
    it('never mixes currencies', () => {
        const totals = totalsByCurrency([row('MXN', 100, 120, 20), row('USD', 50, 40, -10), row('MXN', 10, null, 0)]);
        expect(totals).toEqual([
            { currency: 'MXN', invested: 110, currentValue: 120, gain: 20, fees: 2, missingPrices: true },
            { currency: 'USD', invested: 50, currentValue: 40, gain: -10, fees: 1, missingPrices: false },
        ]);
    });

    it('reports an unknown gain instead of summing a partial total', () => {
        const [mxn] = totalsByCurrency([row('MXN', 100, 120, 20), row('MXN', 50, null, null)]);
        expect(mxn?.gain).toBeNull();
    });

    it('reports an unknown value, not zero, when no open position has a price', () => {
        const [mxn] = totalsByCurrency([row('MXN', 5032.77, null, null, 352)]);
        expect(mxn).toMatchObject({ currentValue: null, gain: null, missingPrices: true, invested: 5032.77 });
    });

    it('keeps a zero value when every position is closed', () => {
        const [mxn] = totalsByCurrency([row('MXN', 0, 0, 150, 0)]);
        expect(mxn).toMatchObject({ currentValue: 0, gain: 150, missingPrices: false });
    });
});

describe('splitTraded', () => {
    it('separates assets that never had a transaction', () => {
        const untraded = { ...row('USD', 0, null, 0, 0), firstTransactionDate: null } as SummaryRow;
        const traded = row('MXN', 10, 12, 2);
        expect(splitTraded([traded, untraded])).toEqual({ traded: [traded], untraded: [untraded] });
    });
});
