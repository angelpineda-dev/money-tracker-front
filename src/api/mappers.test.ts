import { describe, expect, it } from 'vitest';
import { mapAssetListItem, mapTransaction } from './mappers';
import type { AssetListItem, Transaction } from './types';

describe('mapAssetListItem', () => {
    const base = { id: 1, symbol: 'CUERVO.MX', name: 'Becle', currency: 'MXN' } as const;

    it('keeps a missing price as null', () => {
        expect(mapAssetListItem({ ...base, currentPrice: null })).toMatchObject({ currentPrice: null });
    });

    it('coerces a Decimal string price to a number', () => {
        const raw = { ...base, currentPrice: '34.5000' } as unknown as AssetListItem;
        expect(mapAssetListItem(raw).currentPrice).toBe(34.5);
    });
});

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
