import { Add, ArrowBack, DeleteOutlined } from '@mui/icons-material';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import { errorMessage } from '@/api/errors';
import type { DebtPayment } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { DebtProgress } from '@/features/debts/DebtProgress';
import { ExpenseDialog } from '@/features/expenses/ExpenseDialog';
import { useDebt, useDeleteExpense } from '@/features/expenses/queries';
import { formatDate, formatMoney } from '@/lib/format';
import { PATHS } from '@/routes/paths';

export default function DebtDetailPage() {
    const id = Number(useParams().id);
    const debt = useDebt(id);
    const remove = useDeleteExpense();
    const { enqueueSnackbar } = useSnackbar();
    const [paying, setPaying] = useState(false);
    const [toDelete, setToDelete] = useState<DebtPayment | null>(null);
    const d = debt.data;

    return (
        <>
            <Button component={RouterLink} to={PATHS.expenses.debts} startIcon={<ArrowBack />} sx={{ mb: 1 }}>
                Deudas
            </Button>
            <QueryState isPending={debt.isPending} error={debt.error} onRetry={() => debt.refetch()} />
            {d && (
                <>
                    <PageHeader
                        title={d.name}
                        subtitle={d.creditor ?? undefined}
                        action={
                            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                <Chip label={d.currency} variant="outlined" color="primary" />
                                <Button variant="contained" startIcon={<Add />} onClick={() => setPaying(true)}>
                                    Registrar abono
                                </Button>
                            </Stack>
                        }
                    />
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={1}
                                sx={{ alignItems: 'baseline', mb: 1, flexWrap: 'wrap' }}
                                useFlexGap
                            >
                                <Typography variant="h4" component="p" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                    {formatMoney(Math.max(d.balance, 0), d.currency)}
                                </Typography>
                                <Typography color="text.secondary">
                                    pendiente de {formatMoney(d.totalAmount, d.currency)} · abonado{' '}
                                    {formatMoney(d.paidAmount, d.currency)}
                                    {d.dueDate && ` · vence ${formatDate(d.dueDate)}`}
                                </Typography>
                                {d.balance <= 0 && <Chip size="small" color="success" label="Liquidada" />}
                            </Stack>
                            <DebtProgress paid={d.paidAmount} total={d.totalAmount} />
                        </CardContent>
                    </Card>
                    {d.payments.length === 0 ? (
                        <Alert severity="info">Aún no hay abonos.</Alert>
                    ) : (
                        <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                            <Table size="small" sx={{ '& td': { fontVariantNumeric: 'tabular-nums' } }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fecha</TableCell>
                                        <TableCell>Descripción</TableCell>
                                        <TableCell align="right">Monto</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {d.payments.map((p) => (
                                        <TableRow key={p.id} hover>
                                            <TableCell>{formatDate(p.spentAt)}</TableCell>
                                            <TableCell>{p.description}</TableCell>
                                            <TableCell align="right">{formatMoney(p.amount, p.currency)}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Eliminar">
                                                    <IconButton
                                                        size="small"
                                                        aria-label="Eliminar abono"
                                                        onClick={() => {
                                                            remove.reset();
                                                            setToDelete(p);
                                                        }}
                                                    >
                                                        <DeleteOutlined fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    <ExpenseDialog
                        open={paying}
                        expense={null}
                        debt={{ id: d.id, name: d.name, currency: d.currency }}
                        onClose={() => setPaying(false)}
                    />
                </>
            )}
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Eliminar abono"
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setToDelete(null)}
                onConfirm={() =>
                    toDelete &&
                    remove.mutate(toDelete.id, {
                        onSuccess: () => {
                            enqueueSnackbar('Abono eliminado', { variant: 'success' });
                            setToDelete(null);
                        },
                    })
                }
            >
                {toDelete &&
                    `¿Eliminar el abono de ${formatMoney(toDelete.amount, toDelete.currency)} del ${formatDate(toDelete.spentAt)}?`}
            </ConfirmDialog>
        </>
    );
}
