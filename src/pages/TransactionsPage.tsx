import { Add } from '@mui/icons-material';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import type { TransactionFilters } from '@/api/portfolio';
import type { Transaction, TransactionType } from '@/api/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { useAssets, useTransactions } from '@/features/portfolio/queries';
import { TX_TYPES } from '@/features/transactions/schema';
import { TransactionDialog } from '@/features/transactions/TransactionDialog';
import { TransactionsTable } from '@/features/transactions/TransactionsTable';

/** Filters live in the URL so they survive reloads and can be shared. */
function useFilters(): [TransactionFilters, (next: TransactionFilters) => void] {
    const [params, setParams] = useSearchParams();
    const assetId = Number(params.get('assetId'));
    const type = params.get('type');
    const filters: TransactionFilters = {
        assetId: Number.isInteger(assetId) && assetId > 0 ? assetId : undefined,
        type: TX_TYPES.includes(type as TransactionType) ? (type as TransactionType) : undefined,
        from: params.get('from') ?? undefined,
        to: params.get('to') ?? undefined,
    };
    const set = (next: TransactionFilters) => {
        const p = new URLSearchParams();
        for (const [k, v] of Object.entries(next)) if (v !== undefined && v !== '') p.set(k, String(v));
        setParams(p, { replace: true });
    };
    return [filters, set];
}

export default function TransactionsPage() {
    const [filters, setFilters] = useFilters();
    const assets = useAssets();
    const transactions = useTransactions(filters);
    const [dialog, setDialog] = useState<{ open: boolean; tx: Transaction | null }>({ open: false, tx: null });

    return (
        <>
            <PageHeader
                title="Operaciones"
                subtitle="Compras y ventas registradas"
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        disabled={!assets.data?.length}
                        onClick={() => setDialog({ open: true, tx: null })}
                    >
                        Nueva operación
                    </Button>
                }
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 3, flexWrap: 'wrap' }} useFlexGap>
                <TextField
                    select
                    size="small"
                    label="Activo"
                    sx={{ minWidth: 180 }}
                    value={filters.assetId ?? ''}
                    onChange={(e) => setFilters({ ...filters, assetId: Number(e.target.value) || undefined })}
                >
                    <MenuItem value="">Todos</MenuItem>
                    {(assets.data ?? []).map((a) => (
                        <MenuItem key={a.id} value={a.id}>
                            {a.symbol}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    size="small"
                    label="Tipo"
                    sx={{ minWidth: 140 }}
                    value={filters.type ?? ''}
                    onChange={(e) =>
                        setFilters({ ...filters, type: (e.target.value || undefined) as TransactionType | undefined })
                    }
                >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="COMPRA">Compra</MenuItem>
                    <MenuItem value="VENTA">Venta</MenuItem>
                </TextField>
                <DateRangeFilter
                    presets={false}
                    value={{ from: filters.from, to: filters.to }}
                    onChange={(r) => setFilters({ ...filters, ...r })}
                />
            </Stack>
            <QueryState
                isPending={transactions.isPending}
                error={transactions.error}
                onRetry={() => transactions.refetch()}
            />
            {transactions.data && (
                <TransactionsTable
                    rows={[...transactions.data].reverse()}
                    onEdit={(tx) => setDialog({ open: true, tx })}
                />
            )}
            <TransactionDialog
                open={dialog.open}
                transaction={dialog.tx}
                defaultAssetId={filters.assetId}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
        </>
    );
}
