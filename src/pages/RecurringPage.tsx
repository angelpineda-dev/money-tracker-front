import { Add, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import {
    Button,
    IconButton,
    Switch,
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
import { errorMessage } from '@/api/errors';
import type { RecurringPayment } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { CategoryChip } from '@/features/expenses/CategoryChip';
import {
    useDeleteRecurring,
    useExpenseCategories,
    useRecurringPayments,
    useSaveRecurring,
} from '@/features/expenses/queries';
import { FREQUENCY_LABEL } from '@/features/expenses/schema';
import { RecurringDialog } from '@/features/recurring/RecurringDialog';
import { formatDate, formatMoney } from '@/lib/format';

export default function RecurringPage() {
    const payments = useRecurringPayments();
    const categories = useExpenseCategories();
    const save = useSaveRecurring();
    const remove = useDeleteRecurring();
    const { enqueueSnackbar } = useSnackbar();
    const [dialog, setDialog] = useState<{ open: boolean; payment: RecurringPayment | null }>({
        open: false,
        payment: null,
    });
    const [toDelete, setToDelete] = useState<RecurringPayment | null>(null);

    return (
        <>
            <PageHeader
                title="Pagos recurrentes"
                subtitle="Se registran solos como gasto en su fecha de cobro"
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        disabled={!categories.data?.length}
                        onClick={() => setDialog({ open: true, payment: null })}
                    >
                        Nuevo pago
                    </Button>
                }
            />
            <QueryState isPending={payments.isPending} error={payments.error} onRetry={() => payments.refetch()} />
            {save.isError && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {errorMessage(save.error)}
                </Typography>
            )}
            {payments.data?.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    Aún no tienes pagos recurrentes.
                </Typography>
            )}
            {payments.data && payments.data.length > 0 && (
                <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Table
                        size="small"
                        sx={{ '& td, & th': { whiteSpace: 'nowrap' }, '& td': { fontVariantNumeric: 'tabular-nums' } }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Categoría</TableCell>
                                <TableCell align="right">Monto</TableCell>
                                <TableCell>Frecuencia</TableCell>
                                <TableCell>Próximo cobro</TableCell>
                                <TableCell>Activo</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.data.map((p) => (
                                <TableRow key={p.id} hover sx={{ opacity: p.active ? 1 : 0.55 }}>
                                    <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                                    <TableCell>
                                        <CategoryChip category={p.category} />
                                    </TableCell>
                                    <TableCell align="right">{formatMoney(p.amount, p.currency)}</TableCell>
                                    <TableCell>{FREQUENCY_LABEL[p.frequency]}</TableCell>
                                    <TableCell>{formatDate(p.nextRunAt)}</TableCell>
                                    <TableCell>
                                        <Switch
                                            size="small"
                                            checked={p.active}
                                            disabled={save.isPending}
                                            onChange={(e) =>
                                                save.mutate({ id: p.id, body: { active: e.target.checked } })
                                            }
                                            slotProps={{ input: { 'aria-label': `Activar ${p.name}` } }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton
                                                size="small"
                                                aria-label="Editar pago recurrente"
                                                onClick={() => setDialog({ open: true, payment: p })}
                                            >
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                size="small"
                                                aria-label="Eliminar pago recurrente"
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
            <RecurringDialog
                open={dialog.open}
                payment={dialog.payment}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Eliminar pago recurrente"
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setToDelete(null)}
                onConfirm={() =>
                    toDelete &&
                    remove.mutate(toDelete.id, {
                        onSuccess: () => {
                            enqueueSnackbar('Pago recurrente eliminado', { variant: 'success' });
                            setToDelete(null);
                        },
                    })
                }
            >
                {toDelete && `¿Eliminar "${toDelete.name}"? Los gastos ya generados se conservan.`}
            </ConfirmDialog>
        </>
    );
}
