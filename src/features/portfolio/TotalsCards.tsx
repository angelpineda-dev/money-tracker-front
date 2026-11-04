import { Box, Card, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { GainText } from '@/components/GainText';
import { formatMoney } from '@/lib/format';
import type { CurrencyTotals } from './totals';

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="h6" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {children}
            </Typography>
        </Box>
    );
}

export function TotalsCards({ totals }: { totals: CurrencyTotals[] }) {
    return (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
            {totals.map((t) => {
                return (
                    <Card key={t.currency}>
                        <CardContent>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}>
                                <Chip label={t.currency} size="small" color="primary" variant="outlined" />
                                {t.missingPrices && (
                                    <Tooltip title="Algunos activos no tienen precio actual. Actualiza precios en Administración.">
                                        <Chip
                                            label="Precios incompletos"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                        />
                                    </Tooltip>
                                )}
                            </Stack>
                            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(2, 1fr)' }}>
                                <Stat label="Valor actual">{formatMoney(t.currentValue, t.currency)}</Stat>
                                <Stat label="Invertido">{formatMoney(t.invested, t.currency)}</Stat>
                                <Stat label="Ganancia en el rango">
                                    <GainText value={t.gain}>{formatMoney(t.gain, t.currency)}</GainText>
                                </Stat>
                                <Stat label="Comisiones en el rango">{formatMoney(t.fees, t.currency)}</Stat>
                            </Box>
                        </CardContent>
                    </Card>
                );
            })}
        </Box>
    );
}
