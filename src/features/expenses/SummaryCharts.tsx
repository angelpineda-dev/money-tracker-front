import { Box, Card, CardContent, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useState } from 'react';
import type { Currency, ExpenseSummary } from '@/api/types';
import { formatMoney } from '@/lib/format';

/** One set of charts per currency: amounts of different currencies are not comparable. */
export function SummaryCharts({ summary }: { summary: ExpenseSummary }) {
    const currencies = summary.totals.map((t) => t.currency).sort();
    const [picked, setPicked] = useState<Currency | null>(null);
    const currency = picked && currencies.includes(picked) ? picked : currencies[0];
    if (!currency) return null;

    const byCategory = summary.byCategory
        .filter((r) => r.currency === currency)
        .map((r) => ({ id: r.categoryId, value: r.total, label: r.name, ...(r.color ? { color: r.color } : {}) }));
    const byMonth = summary.byMonth.filter((r) => r.currency === currency);

    return (
        <Stack spacing={2}>
            {currencies.length > 1 && (
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={currency}
                    onChange={(_, v: Currency | null) => v && setPicked(v)}
                    aria-label="Moneda"
                >
                    {currencies.map((c) => (
                        <ToggleButton key={c} value={c}>
                            {c}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                            Por categoría
                        </Typography>
                        <PieChart
                            height={260}
                            series={[
                                {
                                    data: byCategory,
                                    innerRadius: 60,
                                    paddingAngle: 1.5,
                                    cornerRadius: 4,
                                    valueFormatter: (item) => formatMoney(item.value, currency),
                                },
                            ]}
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent>
                        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                            Por mes
                        </Typography>
                        <BarChart
                            height={260}
                            xAxis={[{ scaleType: 'band', data: byMonth.map((r) => r.month) }]}
                            series={[
                                {
                                    data: byMonth.map((r) => r.total),
                                    label: currency,
                                    valueFormatter: (v) => formatMoney(v, currency),
                                },
                            ]}
                        />
                    </CardContent>
                </Card>
            </Box>
        </Stack>
    );
}
