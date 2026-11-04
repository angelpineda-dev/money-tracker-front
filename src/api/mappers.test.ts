import { describe, expect, it } from 'vitest';
import { mapTransaction } from './mappers';
import type { Transaction } from './types';

describe('mapTransaction', () => {
    it('coerces Decimal strings and trims the date', () => {
        const raw = {
            id: 1,
            assetId: 2,
            type: 'COMPRA',
            operatedAt: '2025-01-10T00:00:00.000Z',
            quantity: '100',
            pricePerShare: '32.5',
            fees: '45',
            notes: null,
            asset: { symbol: 'CUERVO.MX', currency: 'MXN' },
        } as unknown as Transaction;
        expect(mapTransaction(raw)).toMatchObject({
            operatedAt: '2025-01-10',
            quantity: 100,
            pricePerShare: 32.5,
            fees: 45,
        });
    });
});
