import { describe, expect, it } from 'vitest';
import { mapAssetListItem, mapDebt, mapExpenseSummary, mapSummaryRow, mapTransaction } from './mappers';
import type { AssetListItem, SummaryRow, Transaction } from './types';

describe('mapSummaryRow', () => {
    const raw = {
        asset: { id: 5, symbol: 'LAB B', name: 'Genoma lab', currency: 'MXN' },
        position: '352',
        averageCost: 14.3,
        invested: 5032.77,
        currentPrice: null,
        currentValue: null,
        gain: null,
        gainPct: null,
        feesInRange: '12.54',
    } as unknown as SummaryRow;

    it('keeps an unknown gain as null instead of coercing it to 0', () => {
        expect(mapSummaryRow(raw)).toMatchObject({ gain: null, gainPct: null, currentValue: null });
    });

    it('coerces numeric strings', () => {
        expect(mapSummaryRow(raw)).toMatchObject({ position: 352, feesInRange: 12.54 });
    });
});

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

describe('expense mappers', () => {
    it('coerces decimals and trims dates on debts', () => {
        const debt = mapDebt({
            id: 1,
            name: 'Tarjeta',
            creditor: null,
            totalAmount: '1000.0000' as unknown as number,
            currency: 'MXN',
            dueDate: '2026-03-01T00:00:00.000Z',
            paidAmount: 250,
            balance: '750' as unknown as number,
        });
        expect(debt).toMatchObject({ totalAmount: 1000, balance: 750, dueDate: '2026-03-01' });
    });

    it('keeps a missing due date null', () => {
        const debt = mapDebt({
            id: 1,
            name: 'x',
            creditor: null,
            totalAmount: 1,
            currency: 'USD',
            dueDate: null,
            paidAmount: 0,
            balance: 1,
        });
        expect(debt.dueDate).toBeNull();
    });

    it('maps summary totals to numbers', () => {
        const s = mapExpenseSummary({
            totals: [{ currency: 'MXN', total: '12.5' as unknown as number }],
            byCategory: [],
            byMonth: [],
        });
        expect(s.totals[0]?.total).toBe(12.5);
    });
});
