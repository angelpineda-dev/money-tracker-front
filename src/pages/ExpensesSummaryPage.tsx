import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import type { DateRange } from '@/api/queryKeys';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { useExpenseSummary } from '@/features/expenses/queries';
import { SummaryCharts } from '@/features/expenses/SummaryCharts';
import { formatMoney } from '@/lib/format';
import { PATHS } from '@/routes/paths';

export default function ExpensesSummaryPage() {
    const [range, setRange] = useState<DateRange>({});
    const summary = useExpenseSummary(range);
    const data = summary.data;

    return (
        <>
            <PageHeader title="Resumen de gastos" subtitle="Cuánto gastas, por categoría y por mes" />
            <Box sx={{ mb: 3 }}>
                <DateRangeFilter value={range} onChange={setRange} />
            </Box>
            <QueryState isPending={summary.isPending} error={summary.error} onRetry={() => summary.refetch()} />
            {data && data.totals.length === 0 && (
                <Card>
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
                            <Typography>No hay gastos en este rango.</Typography>
                            <Button component={RouterLink} to={PATHS.expenses.list} variant="contained">
                                Registrar un gasto
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}
            {data && data.totals.length > 0 && (
                <Stack spacing={3} sx={{ opacity: summary.isPlaceholderData ? 0.6 : 1, transition: 'opacity .2s' }}>
                    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
                        {data.totals.map((t) => (
                            <Card key={t.currency}>
                                <CardContent>
                                    <Chip label={t.currency} size="small" color="primary" variant="outlined" />
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        Total gastado
                                    </Typography>
                                    <Typography variant="h5" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                        {formatMoney(t.total, t.currency)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                    <SummaryCharts summary={data} />
                </Stack>
            )}
        </>
    );
}
