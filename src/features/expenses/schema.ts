import { z } from 'zod';
import {
    type CreateCategoryBody,
    type CreateDebtBody,
    type CreateExpenseBody,
    type CreateRecurringBody,
    CURRENCIES,
    FREQUENCIES,
} from '@/api/types';
import { requiredNumber } from '@/features/transactions/schema';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida');
const categoryId = z.number({ error: 'Elige una categoría' }).int().positive('Elige una categoría');
const optionalText = (max: number) =>
    z
        .string()
        .trim()
        .max(max, `Máximo ${max} caracteres`)
        .transform((s) => s || undefined)
        .optional();

export const categorySchema = z.object({
    name: z.string().trim().min(1, 'Requerido').max(40, 'Máximo 40 caracteres'),
    color: z
        .string()
        .regex(/^(#[0-9a-fA-F]{6})?$/, 'Formato #RRGGBB')
        .transform((s) => s || undefined)
        .optional(),
}) satisfies z.ZodType<CreateCategoryBody, unknown>;

export const expenseSchema = z.object({
    categoryId,
    amount: requiredNumber(0.0001),
    currency: z.enum(CURRENCIES),
    spentAt: isoDate,
    description: z.string().trim().min(1, 'Requerido').max(200, 'Máximo 200 caracteres'),
    notes: optionalText(500),
    debtId: z.number().int().positive().optional(),
}) satisfies z.ZodType<CreateExpenseBody, unknown>;

export const recurringSchema = z.object({
    categoryId,
    name: z.string().trim().min(1, 'Requerido').max(120, 'Máximo 120 caracteres'),
    amount: requiredNumber(0.0001),
    currency: z.enum(CURRENCIES),
    frequency: z.enum(FREQUENCIES),
    nextRunAt: isoDate,
    active: z.boolean().default(true),
}) satisfies z.ZodType<CreateRecurringBody, unknown>;

export const debtSchema = z.object({
    name: z.string().trim().min(1, 'Requerido').max(120, 'Máximo 120 caracteres'),
    creditor: optionalText(120),
    totalAmount: requiredNumber(0.0001),
    currency: z.enum(CURRENCIES),
    dueDate: z
        .string()
        .regex(/^(\d{4}-\d{2}-\d{2})?$/, 'Fecha inválida')
        .transform((s) => s || undefined)
        .optional(),
}) satisfies z.ZodType<CreateDebtBody, unknown>;

export type CategoryFormIn = z.input<typeof categorySchema>;
export type CategoryFormOut = z.output<typeof categorySchema>;
export type ExpenseFormIn = z.input<typeof expenseSchema>;
export type ExpenseFormOut = z.output<typeof expenseSchema>;
export type RecurringFormIn = z.input<typeof recurringSchema>;
export type RecurringFormOut = z.output<typeof recurringSchema>;
export type DebtFormIn = z.input<typeof debtSchema>;
export type DebtFormOut = z.output<typeof debtSchema>;

export const FREQUENCY_LABEL = { WEEKLY: 'Semanal', MONTHLY: 'Mensual', YEARLY: 'Anual' } as const satisfies Record<
    (typeof FREQUENCIES)[number],
    string
>;
