import { Add, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, IconButton, Link, Stack, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { errorMessage } from '@/api/errors';
import type { Debt } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { DebtDialog } from '@/features/debts/DebtDialog';
import { DebtProgress } from '@/features/debts/DebtProgress';
import { useDebts, useDeleteDebt } from '@/features/expenses/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { PATHS } from '@/routes/paths';

export default function DebtsPage() {
    const debts = useDebts();
    const remove = useDeleteDebt();
    const { enqueueSnackbar } = useSnackbar();
    const [dialog, setDialog] = useState<{ open: boolean; debt: Debt | null }>({ open: false, debt: null });
    const [toDelete, setToDelete] = useState<Debt | null>(null);

    return (
        <>
            <PageHeader
                title="Deudas"
                subtitle="Lo que debes y cuánto llevas abonado"
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setDialog({ open: true, debt: null })}
                    >
                        Nueva deuda
                    </Button>
                }
            />
            <QueryState isPending={debts.isPending} error={debts.error} onRetry={() => debts.refetch()} />
            {debts.data?.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No tienes deudas registradas.
                </Typography>
            )}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
                {debts.data?.map((d) => (
                    <Card key={d.id}>
                        <CardContent>
                            <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box>
                                    <Link
                                        component={RouterLink}
                                        to={PATHS.expenses.debt(d.id)}
                                        variant="h6"
                                        underline="hover"
                                    >
                                        {d.name}
                                    </Link>
                                    <Typography variant="body2" color="text.secondary">
                                        {[d.creditor, d.dueDate && `vence ${formatDate(d.dueDate)}`]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                    </Typography>
                                </Box>
                                <Box>
                                    <Tooltip title="Editar">
                                        <IconButton
                                            size="small"
                                            aria-label="Editar deuda"
                                            onClick={() => setDialog({ open: true, debt: d })}
                                        >
                                            <EditOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            size="small"
                                            aria-label="Eliminar deuda"
                                            onClick={() => {
                                                remove.reset();
                                                setToDelete(d);
                                            }}
                                        >
                                            <DeleteOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Stack>
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mt: 2, mb: 1 }}>
                                <Typography variant="h5" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {formatMoney(Math.max(d.balance, 0), d.currency)}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    pendiente de {formatMoney(d.totalAmount, d.currency)}
                                </Typography>
                                {d.balance <= 0 && <Chip size="small" color="success" label="Liquidada" />}
                            </Stack>
                            <DebtProgress paid={d.paidAmount} total={d.totalAmount} />
                        </CardContent>
                    </Card>
                ))}
            </Box>
            <DebtDialog
                open={dialog.open}
                debt={dialog.debt}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Eliminar deuda"
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setToDelete(null)}
                onConfirm={() =>
                    toDelete &&
                    remove.mutate(toDelete.id, {
                        onSuccess: () => {
                            enqueueSnackbar('Deuda eliminada', { variant: 'success' });
                            setToDelete(null);
                        },
                    })
                }
            >
                {toDelete && `¿Eliminar "${toDelete.name}"? Sus abonos se conservan como gastos normales.`}
            </ConfirmDialog>
        </>
    );
}
