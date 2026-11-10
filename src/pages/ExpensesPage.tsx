import { Add } from '@mui/icons-material';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import type { ExpenseFilters } from '@/api/expenses';
import { CURRENCIES, type Currency, type Expense } from '@/api/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { ExpenseDialog } from '@/features/expenses/ExpenseDialog';
import { ExpensesTable } from '@/features/expenses/ExpensesTable';
import { useExpenseCategories, useExpenses } from '@/features/expenses/queries';

/** Filters live in the URL so they survive reloads and can be shared. */
function useFilters(): [ExpenseFilters, (next: ExpenseFilters) => void] {
    const [params, setParams] = useSearchParams();
    const categoryId = Number(params.get('categoryId'));
    const currency = params.get('currency');
    const filters: ExpenseFilters = {
        categoryId: Number.isInteger(categoryId) && categoryId > 0 ? categoryId : undefined,
        currency: CURRENCIES.includes(currency as Currency) ? (currency as Currency) : undefined,
        from: params.get('from') ?? undefined,
        to: params.get('to') ?? undefined,
    };
    const set = (next: ExpenseFilters) => {
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== '') p.set(k, String(v));
        setParams(p, { replace: true });
    };
    return [filters, set];
}

export default function ExpensesPage() {
    const [filters, setFilters] = useFilters();
    const categories = useExpenseCategories();
    const expenses = useExpenses(filters);
    const [dialog, setDialog] = useState<{ open: boolean; expense: Expense | null }>({ open: false, expense: null });

    return (
        <>
            <PageHeader
                title="Movimientos"
                subtitle="Gastos diarios, recurrentes y abonos a deudas"
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        disabled={!categories.data?.length}
                        onClick={() => setDialog({ open: true, expense: null })}
                    >
                        Nuevo gasto
                    </Button>
                }
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
                <TextField
                    select
                    size="small"
                    label="Categoría"
                    sx={{ minWidth: 180 }}
                    value={filters.categoryId ?? ''}
                    onChange={(e) => setFilters({ ...filters, categoryId: Number(e.target.value) || undefined })}
                >
                    <MenuItem value="">Todas</MenuItem>
                    {(categories.data ?? []).map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                            {c.name}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Moneda"
                    sx={{ minWidth: 120 }}
                    value={filters.currency ?? ''}
                    onChange={(e) =>
                        setFilters({ ...filters, currency: (e.target.value || undefined) as Currency | undefined })
                    }
                >
                    <MenuItem value="">Todas</MenuItem>
                    {CURRENCIES.map((c) => (
                        <MenuItem key={c} value={c}>
                            {c}
                        </MenuItem>
                    ))}
                </TextField>
                <DateRangeFilter
                    value={{ from: filters.from, to: filters.to }}
                    onChange={(r) => setFilters({ ...filters, ...r })}
                />
            </Stack>
            <QueryState isPending={expenses.isPending} error={expenses.error} onRetry={() => expenses.refetch()} />
            {expenses.data && (
                <ExpensesTable rows={expenses.data} onEdit={(expense) => setDialog({ open: true, expense })} />
            )}
            <ExpenseDialog
                open={dialog.open}
                expense={dialog.expense}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
        </>
    );
}
