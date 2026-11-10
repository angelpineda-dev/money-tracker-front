import { Add } from '@mui/icons-material';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import type { IncomeFilters } from '@/api/expenses';
import { CURRENCIES, type Currency, type Income } from '@/api/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { IncomeDialog } from '@/features/expenses/IncomeDialog';
import { IncomeTable } from '@/features/expenses/IncomeTable';
import { useIncome } from '@/features/expenses/queries';

export default function IncomePage() {
    const [filters, setFilters] = useState<IncomeFilters>({});
    const income = useIncome(filters);
    const [dialog, setDialog] = useState<{ open: boolean; income: Income | null }>({ open: false, income: null });

    return (
        <>
            <PageHeader
                title="Ingresos"
                subtitle="Lo que recibes, para compararlo con tus gastos"
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setDialog({ open: true, income: null })}
                    >
                        Nuevo ingreso
                    </Button>
                }
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
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
            <QueryState isPending={income.isPending} error={income.error} onRetry={() => income.refetch()} />
            {income.data && <IncomeTable rows={income.data} onEdit={(i) => setDialog({ open: true, income: i })} />}
            <IncomeDialog
                open={dialog.open}
                income={dialog.income}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
        </>
    );
}
