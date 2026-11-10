import {
    Chip,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router';
import type { SummaryRow } from '@/api/types';
import { GainText } from '@/components/GainText';
import { formatMoney, formatPercent } from '@/lib/format';
import { PATHS } from '@/routes/paths';

const qty = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 6 });

export function SummaryTable({ rows }: { rows: SummaryRow[] }) {
    return (
        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Table
                size="small"
                sx={{ '& td, & th': { whiteSpace: 'nowrap' }, '& td': { fontVariantNumeric: 'tabular-nums' } }}
            >
                <TableHead>
                    <TableRow>
                        <TableCell>Activo</TableCell>
                        <TableCell align="right">Posición</TableCell>
                        <TableCell align="right">Costo prom.</TableCell>
                        <TableCell align="right">Invertido</TableCell>
                        <TableCell align="right">Precio</TableCell>
                        <TableCell align="right">Valor</TableCell>
                        <TableCell align="right">Ganancia (bruta)</TableCell>
                        <TableCell align="right">%</TableCell>
                        <TableCell align="right">Comisiones + IVA</TableCell>
                        <TableCell />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((r) => {
                        const c = r.asset.currency;
                        return (
                            <TableRow key={r.asset.id} hover sx={{ opacity: r.position > 0 ? 1 : 0.6 }}>
                                <TableCell>
                                    <Link
                                        component={RouterLink}
                                        to={PATHS.investments.asset(r.asset.id)}
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {r.asset.symbol}
                                    </Link>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                        {r.asset.name}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">{qty.format(r.position)}</TableCell>
                                <TableCell align="right">{formatMoney(r.averageCost, c)}</TableCell>
                                <TableCell align="right">{formatMoney(r.invested, c)}</TableCell>
                                <TableCell align="right">{formatMoney(r.currentPrice, c)}</TableCell>
                                <TableCell align="right">{formatMoney(r.currentValue, c)}</TableCell>
                                <TableCell align="right">
                                    <GainText value={r.gain}>{formatMoney(r.gain, c)}</GainText>
                                </TableCell>
                                <TableCell align="right">
                                    <GainText value={r.gainPct}>{formatPercent(r.gainPct)}</GainText>
                                </TableCell>
                                <TableCell align="right">{formatMoney(r.feesInRange, c)}</TableCell>
                                <TableCell>
                                    {r.boughtThisWeek && (
                                        <Chip
                                            label="Compró esta semana"
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                        />
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
