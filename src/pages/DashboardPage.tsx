import { Box, Button, Card, CardContent, Link, Stack, Typography } from '@mui/material';
import { Fragment, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import type { DateRange } from '@/api/queryKeys';
import { DateRangeFilter } from '@/components/DateRangeFilter';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { AllocationChart } from '@/features/portfolio/AllocationChart';
import { useSummary } from '@/features/portfolio/queries';
import { SummaryTable } from '@/features/portfolio/SummaryTable';
import { TotalsCards } from '@/features/portfolio/TotalsCards';
import { splitTraded, totalsByCurrency } from '@/features/portfolio/totals';
import { PATHS } from '@/routes/paths';

export default function DashboardPage() {
    const [range, setRange] = useState<DateRange>({});
    const summary = useSummary(range);
    const rows = summary.data ?? [];
    const { traded, untraded } = splitTraded(rows);

    return (
        <>
            <PageHeader title="Resumen" subtitle="Rendimiento de tu portafolio por moneda" />
            <Box sx={{ mb: 3 }}>
                <DateRangeFilter value={range} onChange={setRange} />
            </Box>
            <QueryState isPending={summary.isPending} error={summary.error} onRetry={() => summary.refetch()} />
            {summary.isSuccess && rows.length === 0 && (
                <Card>
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
                            <Typography>Aún no tienes activos registrados.</Typography>
                            <Button component={RouterLink} to={PATHS.investments.assets} variant="contained">
                                Agregar un activo
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}
            {summary.isSuccess && rows.length > 0 && traded.length === 0 && (
                <Card>
                    <CardContent>
                        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
                            <Typography>Aún no registras operaciones en tus activos.</Typography>
                            <Button component={RouterLink} to={PATHS.investments.transactions} variant="contained">
                                Registrar una operación
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            )}
            {traded.length > 0 && (
                <Stack spacing={3} sx={{ opacity: summary.isPlaceholderData ? 0.6 : 1, transition: 'opacity .2s' }}>
                    <TotalsCards totals={totalsByCurrency(traded)} />
                    <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' } }}>
                        <Box sx={{ minWidth: 0 }}>
                            <SummaryTable rows={traded} />
                        </Box>
                        <AllocationChart rows={traded} />
                    </Box>
                </Stack>
            )}
            {traded.length > 0 && untraded.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Sin operaciones:{' '}
                    {untraded.map((r, i) => (
                        <Fragment key={r.asset.id}>
                            {i > 0 && ', '}
                            <Link component={RouterLink} to={PATHS.investments.asset(r.asset.id)}>
                                {r.asset.symbol}
                            </Link>
                        </Fragment>
                    ))}
                </Typography>
            )}
        </>
    );
}
