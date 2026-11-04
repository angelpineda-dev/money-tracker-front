import { Add, ArrowBack } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import dayjs from 'dayjs';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import type { DateRange } from '@/api/queryKeys';
import type { Transaction } from '@/api/types';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { useAssetPerformance, useAssets, useTransactions } from '@/features/portfolio/queries';
import { TransactionDialog } from '@/features/transactions/TransactionDialog';
import { TransactionsTable } from '@/features/transactions/TransactionsTable';
import { formatDate, formatMoney } from '@/lib/format';

export default function AssetDetailPage() {
    const id = Number(useParams().id);
    const assets = useAssets();
    const asset = assets.data?.find((a) => a.id === id);
    const [range, setRange] = useState<DateRange>({});
    const performance = useAssetPerformance(id, range);
    const transactions = useTransactions({ assetId: id });
    const [dialog, setDialog] = useState<{ open: boolean; tx: Transaction | null }>({ open: false, tx: null });

    if (assets.isSuccess && !asset) {
        return (
            <Alert
                severity="warning"
                action={
                    <Button component={RouterLink} to="/assets" color="inherit" size="small">
                        Volver
                    </Button>
                }
            >
                Activo no encontrado.
            </Alert>
        );
    }

    const points = performance.data ?? [];
    const currency = asset?.currency ?? 'MXN';

    return (
        <>
            <Button component={RouterLink} to="/assets" startIcon={<ArrowBack />} sx={{ mb: 1 }}>
                Activos
            </Button>
            <PageHeader
                title={asset?.symbol ?? '…'}
                subtitle={asset?.name}
                action={asset && <Chip label={asset.currency} variant="outlined" color="primary" />}
            />
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, mb: 2 }}
                    >
                        <Typography variant="h6" component="h2">
                            Valor vs invertido
                        </Typography>
                        <DateRangeFilter value={range} onChange={setRange} />
                    </Stack>
                    <QueryState isPending={performance.isPending} error={performance.error} />
                    {performance.isSuccess && points.length === 0 && (
                        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                            Sin datos en este rango.
                        </Typography>
                    )}
                    {points.length > 0 && (
                        <Box sx={{ opacity: performance.isPlaceholderData ? 0.6 : 1 }}>
                            <LineChart
                                height={320}
                                xAxis={[
                                    {
                                        data: points.map((p) => dayjs(p.date).toDate()),
                                        scaleType: 'time',
                                        valueFormatter: (d: Date) => formatDate(d, 'D MMM YY'),
                                    },
                                ]}
                                yAxis={[{ valueFormatter: (v: number | null) => formatMoney(v, currency), width: 90 }]}
                                series={[
                                    {
                                        label: 'Valor',
                                        data: points.map((p) => p.value),
                                        showMark: false,
                                        area: true,
                                        valueFormatter: (v) => formatMoney(v, currency),
                                    },
                                    {
                                        label: 'Invertido',
                                        data: points.map((p) => p.invested),
                                        showMark: false,
                                        curve: 'stepAfter',
                                        valueFormatter: (v) => formatMoney(v, currency),
                                    },
                                ]}
                                sx={{ '& .MuiAreaElement-root': { fillOpacity: 0.15 } }}
                            />
                        </Box>
                    )}
                </CardContent>
            </Card>
            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                    Operaciones
                </Typography>
                <Button startIcon={<Add />} onClick={() => setDialog({ open: true, tx: null })} disabled={!asset}>
                    Nueva operación
                </Button>
            </Stack>
            <QueryState isPending={transactions.isPending} error={transactions.error} />
            {transactions.data && (
                <TransactionsTable
                    rows={[...transactions.data].reverse()}
                    showAsset={false}
                    onEdit={(tx) => setDialog({ open: true, tx })}
                />
            )}
            <TransactionDialog
                open={dialog.open}
                transaction={dialog.tx}
                defaultAssetId={id}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
        </>
    );
}
