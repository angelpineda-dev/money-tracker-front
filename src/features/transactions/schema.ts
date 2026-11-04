import { z } from 'zod';
import type { CreateTransactionBody, TransactionType } from '@/api/types';

export const TX_TYPES = ['COMPRA', 'VENTA'] as const satisfies readonly TransactionType[];

/** Number inputs use `setValueAs: toOptionalNumber`; an empty field becomes undefined so zod reports "Requerido". */
export const toOptionalNumber = (v: unknown) => (v === '' || v === null || v === undefined ? undefined : Number(v));

const requiredNumber = (min: number) => z.number({ error: 'Requerido' }).min(min, 'Debe ser mayor a 0');

export const transactionSchema = z.object({
    assetId: z.number({ error: 'Elige un activo' }).int().positive('Elige un activo'),
    type: z.enum(TX_TYPES),
    operatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
    quantity: requiredNumber(0.000001),
    pricePerShare: requiredNumber(0.0001),
    fees: z.number({ error: 'Número inválido' }).min(0, 'No puede ser negativa').optional().default(0),
    notes: z
        .string()
        .trim()
        .max(500, 'Máximo 500 caracteres')
        .transform((s) => s || undefined)
        .optional(),
}) satisfies z.ZodType<CreateTransactionBody, unknown>;

export type TransactionFormIn = z.input<typeof transactionSchema>;
export type TransactionFormOut = z.output<typeof transactionSchema>;
