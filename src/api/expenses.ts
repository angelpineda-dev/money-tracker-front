import { api, unwrap } from './client';
import {
    mapCashflowMonth,
    mapDebt,
    mapDebtDetail,
    mapExpense,
    mapExpenseSummary,
    mapIncome,
    mapRecurring,
} from './mappers';
import type { DateRange } from './queryKeys';
import type {
    CashflowMonth,
    CreateCategoryBody,
    CreateDebtBody,
    CreateExpenseBody,
    CreateIncomeBody,
    CreateRecurringBody,
    Currency,
    Debt,
    DebtDetail,
    Expense,
    ExpenseCategory,
    ExpenseSummary,
    Income,
    RecurringPayment,
    UpdateCategoryBody,
    UpdateDebtBody,
    UpdateExpenseBody,
    UpdateIncomeBody,
    UpdateRecurringBody,
} from './types';

export interface ExpenseFilters extends DateRange {
    categoryId?: number;
    currency?: Currency;
    debtId?: number;
}

/** Drops empty values so they never reach the query string. */
function params<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== '')) as Partial<T>;
}

export const expenseCategoriesApi = {
    list: () => unwrap<ExpenseCategory[]>(api.get('/api/expense-categories')),
    create: (body: CreateCategoryBody) => unwrap<ExpenseCategory>(api.post('/api/expense-categories', body)),
    update: (id: number, body: UpdateCategoryBody) =>
        unwrap<ExpenseCategory>(api.patch(`/api/expense-categories/${id}`, body)),
    remove: (id: number) => unwrap<undefined>(api.delete(`/api/expense-categories/${id}`)),
};

export const expensesApi = {
    list: async (filters: ExpenseFilters) =>
        (await unwrap<Expense[]>(api.get('/api/expenses', { params: params(filters) }))).map(mapExpense),
    create: async (body: CreateExpenseBody) => mapExpense(await unwrap<Expense>(api.post('/api/expenses', body))),
    update: async (id: number, body: UpdateExpenseBody) =>
        mapExpense(await unwrap<Expense>(api.patch(`/api/expenses/${id}`, body))),
    remove: (id: number) => unwrap<undefined>(api.delete(`/api/expenses/${id}`)),
    summary: async (range: DateRange) =>
        mapExpenseSummary(await unwrap<ExpenseSummary>(api.get('/api/expenses/summary', { params: params(range) }))),
};

export interface IncomeFilters extends DateRange {
    currency?: Currency;
}

export const incomeApi = {
    list: async (filters: IncomeFilters) =>
        (await unwrap<Income[]>(api.get('/api/income', { params: params(filters) }))).map(mapIncome),
    create: async (body: CreateIncomeBody) => mapIncome(await unwrap<Income>(api.post('/api/income', body))),
    update: async (id: number, body: UpdateIncomeBody) =>
        mapIncome(await unwrap<Income>(api.patch(`/api/income/${id}`, body))),
    remove: (id: number) => unwrap<undefined>(api.delete(`/api/income/${id}`)),
    cashflow: async (range: DateRange) =>
        (await unwrap<CashflowMonth[]>(api.get('/api/income/cashflow', { params: params(range) }))).map(
            mapCashflowMonth,
        ),
};

export const recurringApi = {
    list: async () => (await unwrap<RecurringPayment[]>(api.get('/api/recurring-payments'))).map(mapRecurring),
    create: async (body: CreateRecurringBody) =>
        mapRecurring(await unwrap<RecurringPayment>(api.post('/api/recurring-payments', body))),
    update: async (id: number, body: UpdateRecurringBody) =>
        mapRecurring(await unwrap<RecurringPayment>(api.patch(`/api/recurring-payments/${id}`, body))),
    remove: (id: number) => unwrap<undefined>(api.delete(`/api/recurring-payments/${id}`)),
};

export const debtsApi = {
    list: async () => (await unwrap<Debt[]>(api.get('/api/debts'))).map(mapDebt),
    get: async (id: number) => mapDebtDetail(await unwrap<DebtDetail>(api.get(`/api/debts/${id}`))),
    create: async (body: CreateDebtBody) => mapDebtDetail(await unwrap<DebtDetail>(api.post('/api/debts', body))),
    update: async (id: number, body: UpdateDebtBody) =>
        mapDebtDetail(await unwrap<DebtDetail>(api.patch(`/api/debts/${id}`, body))),
    remove: (id: number) => unwrap<undefined>(api.delete(`/api/debts/${id}`)),
};
