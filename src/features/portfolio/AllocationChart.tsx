import { Card, CardContent, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { useState } from 'react';
import type { Currency, SummaryRow } from '@/api/types';
import { formatMoney } from '@/lib/format';

/** One pie per currency: slices of different currencies are not comparable. */
export function AllocationChart({ rows }: { rows: SummaryRow[] }) {
    const currencies = [...new Set(rows.map((r) => r.asset.currency))].sort();
    const [picked, setPicked] = useState<Currency | null>(null);
    const currency = picked && currencies.includes(picked) ? picked : currencies[0];
    if (!currency) return null;

    const data = rows
        .filter((r) => r.asset.currency === currency && (r.currentValue ?? 0) > 0)
        .map((r) => ({ id: r.asset.id, value: r.currentValue ?? 0, label: r.asset.symbol }));

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="h2">
                        Distribución
                    </Typography>
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
                </Stack>
                {data.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>
                        Sin posiciones con precio en {currency}.
                    </Typography>
                ) : (
                    <PieChart
                        height={260}
                        series={[
                            {
                                data,
                                innerRadius: 60,
                                paddingAngle: 1.5,
                                cornerRadius: 4,
                                valueFormatter: (item) => formatMoney(item.value, currency),
                            },
                        ]}
                    />
                )}
            </CardContent>
        </Card>
    );
}
