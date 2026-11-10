import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    debtsApi,
    type ExpenseFilters,
    expenseCategoriesApi,
    expensesApi,
    type IncomeFilters,
    incomeApi,
    recurringApi,
} from '@/api/expenses';
import { type DateRange, queryKeys } from '@/api/queryKeys';
import type {
    CreateCategoryBody,
    CreateDebtBody,
    CreateExpenseBody,
    CreateIncomeBody,
    CreateRecurringBody,
    UpdateCategoryBody,
    UpdateDebtBody,
    UpdateExpenseBody,
    UpdateIncomeBody,
    UpdateRecurringBody,
} from '@/api/types';

export function useExpenseCategories() {
    return useQuery({ queryKey: queryKeys.expenseSection.categories(), queryFn: expenseCategoriesApi.list });
}

export function useExpenses(filters: ExpenseFilters) {
    return useQuery({
        queryKey: queryKeys.expenseSection.list(filters),
        queryFn: () => expensesApi.list(filters),
        placeholderData: keepPreviousData,
    });
}

export function useExpenseSummary(range: DateRange) {
    return useQuery({
        queryKey: queryKeys.expenseSection.summary(range),
        queryFn: () => expensesApi.summary(range),
        placeholderData: keepPreviousData,
    });
}

export function useRecurringPayments() {
    return useQuery({ queryKey: queryKeys.expenseSection.recurring(), queryFn: recurringApi.list });
}

export function useDebts() {
    return useQuery({ queryKey: queryKeys.expenseSection.debts(), queryFn: debtsApi.list });
}

export function useDebt(id: number) {
    return useQuery({ queryKey: queryKeys.expenseSection.debt(id), queryFn: () => debtsApi.get(id) });
}

/** Any change in the section can alter lists, the summary and debt balances, so refresh all of it. */
function useInvalidateExpenses() {
    const qc = useQueryClient();
    return () => qc.invalidateQueries({ queryKey: queryKeys.expenseSection.all });
}

type SaveVars<Create, Update> = { id?: number; body: Create | Update };

export function useSaveCategory() {
    const invalidate = useInvalidateExpenses();
    return useMutation({
        mutationFn: ({ id, body }: SaveVars<CreateCategoryBody, UpdateCategoryBody>) =>
            id === undefined
                ? expenseCategoriesApi.create(body as CreateCategoryBody)
                : expenseCategoriesApi.update(id, body),
        onSuccess: invalidate,
    });
}

export function useDeleteCategory() {
    const invalidate = useInvalidateExpenses();
    return useMutation({ mutationFn: expenseCategoriesApi.remove, onSuccess: invalidate });
}

export function useSaveExpense() {
    const invalidate = useInvalidateExpenses();
    return useMutation({
        mutationFn: ({ id, body }: SaveVars<CreateExpenseBody, UpdateExpenseBody>) =>
            id === undefined ? expensesApi.create(body as CreateExpenseBody) : expensesApi.update(id, body),
        onSuccess: invalidate,
    });
}

export function useDeleteExpense() {
    const invalidate = useInvalidateExpenses();
    return useMutation({ mutationFn: expensesApi.remove, onSuccess: invalidate });
}

export function useSaveRecurring() {
    const invalidate = useInvalidateExpenses();
    return useMutation({
        mutationFn: ({ id, body }: SaveVars<CreateRecurringBody, UpdateRecurringBody>) =>
            id === undefined ? recurringApi.create(body as CreateRecurringBody) : recurringApi.update(id, body),
        onSuccess: invalidate,
    });
}

export function useDeleteRecurring() {
    const invalidate = useInvalidateExpenses();
    return useMutation({ mutationFn: recurringApi.remove, onSuccess: invalidate });
}

export function useSaveDebt() {
    const invalidate = useInvalidateExpenses();
    return useMutation({
        mutationFn: ({ id, body }: SaveVars<CreateDebtBody, UpdateDebtBody>) =>
            id === undefined ? debtsApi.create(body as CreateDebtBody) : debtsApi.update(id, body),
        onSuccess: invalidate,
    });
}

export function useDeleteDebt() {
    const invalidate = useInvalidateExpenses();
    return useMutation({ mutationFn: debtsApi.remove, onSuccess: invalidate });
}

export function useIncome(filters: IncomeFilters) {
    return useQuery({
        queryKey: queryKeys.expenseSection.income(filters),
        queryFn: () => incomeApi.list(filters),
        placeholderData: keepPreviousData,
    });
}

export function useCashflow(range: DateRange) {
    return useQuery({
        queryKey: queryKeys.expenseSection.cashflow(range),
        queryFn: () => incomeApi.cashflow(range),
        placeholderData: keepPreviousData,
    });
}

export function useSaveIncome() {
    const invalidate = useInvalidateExpenses();
    return useMutation({
        mutationFn: ({ id, body }: SaveVars<CreateIncomeBody, UpdateIncomeBody>) =>
            id === undefined ? incomeApi.create(body as CreateIncomeBody) : incomeApi.update(id, body),
        onSuccess: invalidate,
    });
}

export function useDeleteIncome() {
    const invalidate = useInvalidateExpenses();
    return useMutation({ mutationFn: incomeApi.remove, onSuccess: invalidate });
}
