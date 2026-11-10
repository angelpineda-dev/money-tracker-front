import { describe, expect, it } from 'vitest';
import { debtSchema, expenseSchema, recurringSchema } from './schema';

const expense = { categoryId: 1, amount: 50, currency: 'MXN', spentAt: '2026-01-10', description: 'Tacos' };

describe('expenseSchema', () => {
    it('accepts a valid expense and drops an empty note', () => {
        const parsed = expenseSchema.parse({ ...expense, notes: '  ' });
        expect(parsed.notes).toBeUndefined();
    });

    it('rejects missing category, zero amount and bad date', () => {
        const result = expenseSchema.safeParse({ ...expense, categoryId: undefined, amount: 0, spentAt: '10/01/2026' });
        expect(result.success).toBe(false);
        const paths = result.error?.issues.map((i) => i.path[0]);
        expect(paths).toEqual(expect.arrayContaining(['categoryId', 'amount', 'spentAt']));
    });

    it('rejects an unsupported currency', () => {
        expect(expenseSchema.safeParse({ ...expense, currency: 'EUR' }).success).toBe(false);
    });
});

describe('recurringSchema', () => {
    const base = {
        categoryId: 1,
        name: 'Netflix',
        amount: 219,
        currency: 'MXN',
        frequency: 'MONTHLY',
        nextRunAt: '2026-02-01',
    };

    it('defaults active to true', () => {
        expect(recurringSchema.parse(base).active).toBe(true);
    });

    it('rejects unknown frequency', () => {
        expect(recurringSchema.safeParse({ ...base, frequency: 'DAILY' }).success).toBe(false);
    });
});

describe('debtSchema', () => {
    it('treats empty optional fields as undefined', () => {
        const parsed = debtSchema.parse({
            name: 'Tarjeta',
            creditor: '',
            totalAmount: 1000,
            currency: 'MXN',
            dueDate: '',
        });
        expect(parsed.creditor).toBeUndefined();
        expect(parsed.dueDate).toBeUndefined();
    });
});
