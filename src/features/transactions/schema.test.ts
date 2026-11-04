import { describe, expect, it } from 'vitest';
import { transactionSchema } from './schema';

const valid = {
    assetId: 1,
    type: 'COMPRA',
    operatedAt: '2025-01-10',
    quantity: 10,
    pricePerShare: 32.5,
    fees: undefined,
    notes: '  ',
};

describe('transactionSchema', () => {
    it('defaults empty fees to 0 and drops blank notes', () => {
        expect(transactionSchema.parse(valid)).toEqual({ ...valid, fees: 0, notes: undefined });
    });

    it('rejects zero quantity and empty price', () => {
        const result = transactionSchema.safeParse({ ...valid, quantity: 0, pricePerShare: undefined });
        expect(result.success).toBe(false);
        const messages = Object.fromEntries(result.error?.issues.map((i) => [i.path[0], i.message]) ?? []);
        expect(messages).toEqual({ quantity: 'Debe ser mayor a 0', pricePerShare: 'Requerido' });
    });
});
