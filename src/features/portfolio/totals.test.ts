import { describe, expect, it } from 'vitest';
import type { SummaryRow } from '@/api/types';
import { totalsByCurrency } from './totals';

const row = (currency: 'MXN' | 'USD', invested: number, value: number | null, gain: number) =>
    ({
        asset: { id: 1, symbol: 'X', name: 'X', currency },
        position: 1,
        invested,
        currentValue: value,
        gain,
        feesInRange: 1,
    }) as SummaryRow;

describe('totalsByCurrency', () => {
    it('never mixes currencies', () => {
        const totals = totalsByCurrency([row('MXN', 100, 120, 20), row('USD', 50, 40, -10), row('MXN', 10, null, 0)]);
        expect(totals).toEqual([
            { currency: 'MXN', invested: 110, currentValue: 120, gain: 20, fees: 2, missingPrices: true },
            { currency: 'USD', invested: 50, currentValue: 40, gain: -10, fees: 1, missingPrices: false },
        ]);
    });
});
