import {
    Box,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useState } from 'react';
import type { CashflowMonth, Currency } from '@/api/types';
import { formatMoney } from '@/lib/format';

/** Income vs expenses month by month. One currency at a time: amounts of different currencies are not comparable. */
export function CashflowSection({ months }: { months: CashflowMonth[] }) {
    const currencies = [...new Set(months.map((m) => m.currency))].sort();
    const [picked, setPicked] = useState<Currency | null>(null);
    const currency = picked && currencies.includes(picked) ? picked : currencies[0];
    if (!currency) return null;

    const rows = months.filter((m) => m.currency === currency);

    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" component="h2">
                            Ingresos vs gastos por mes
                        </Typography>
                        {currencies.length > 1 && (
                            <ToggleButtonGroup
                                size="small"
                                exclusive
                                value={currency}
                                onChange={(_, v: Currency | null) => v && setPicked(v)}
                                aria-label="Moneda del flujo"
                            >
                                {currencies.map((c) => (
                                    <ToggleButton key={c} value={c}>
                                        {c}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        )}
                    </Stack>
                    <BarChart
                        height={280}
                        xAxis={[{ scaleType: 'band', data: rows.map((r) => r.month) }]}
                        series={[
                            {
                                data: rows.map((r) => r.income),
                                label: 'Ingresos',
                                color: '#2e7d32',
                                valueFormatter: (v) => formatMoney(v, currency),
                            },
                            {
                                data: rows.map((r) => r.expenses),
                                label: 'Gastos',
                                color: '#c62828',
                                valueFormatter: (v) => formatMoney(v, currency),
                            },
                        ]}
                    />
                    <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                        <Table
                            size="small"
                            sx={{
                                '& td, & th': { whiteSpace: 'nowrap' },
                                '& td': { fontVariantNumeric: 'tabular-nums' },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Mes</TableCell>
                                    <TableCell align="right">Ingresos</TableCell>
                                    <TableCell align="right">Gastos</TableCell>
                                    <TableCell align="right">Balance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((r) => (
                                    <TableRow key={r.month} hover>
                                        <TableCell>{r.month}</TableCell>
                                        <TableCell align="right">{formatMoney(r.income, currency)}</TableCell>
                                        <TableCell align="right">{formatMoney(r.expenses, currency)}</TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ color: r.balance < 0 ? 'error.main' : 'success.main' }}
                                        >
                                            <Box component="span" sx={{ fontWeight: 600 }}>
                                                {formatMoney(r.balance, currency)}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Stack>
            </CardContent>
        </Card>
    );
}
