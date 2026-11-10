import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import {
    Chip,
    IconButton,
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
import type { Expense } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatDate, formatMoney } from '@/lib/format';
import { CategoryChip } from './CategoryChip';
import { useDeleteExpense } from './queries';

export function ExpensesTable({ rows, onEdit }: { rows: Expense[]; onEdit: (expense: Expense) => void }) {
    const remove = useDeleteExpense();
    const { enqueueSnackbar } = useSnackbar();
    const [toDelete, setToDelete] = useState<Expense | null>(null);

    if (rows.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No hay gastos con estos filtros.
            </Typography>
        );
    }

    return (
        <>
            <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                <Table
                    size="small"
                    sx={{ '& td, & th': { whiteSpace: 'nowrap' }, '& td': { fontVariantNumeric: 'tabular-nums' } }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Categoría</TableCell>
                            <TableCell align="right">Monto</TableCell>
                            <TableCell />
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((e) => (
                            <TableRow key={e.id} hover>
                                <TableCell>{formatDate(e.spentAt)}</TableCell>
                                <TableCell
                                    sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    title={e.notes ?? ''}
                                >
                                    {e.description}
                                </TableCell>
                                <TableCell>
                                    <CategoryChip category={e.category} />
                                </TableCell>
                                <TableCell align="right">{formatMoney(e.amount, e.currency)}</TableCell>
                                <TableCell>
                                    {e.debt && <Chip size="small" color="warning" label={`Abono: ${e.debt.name}`} />}
                                    {e.recurringPaymentId !== null && (
                                        <Chip size="small" color="info" variant="outlined" label="Recurrente" />
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Editar">
                                        <IconButton size="small" aria-label="Editar gasto" onClick={() => onEdit(e)}>
                                            <EditOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            size="small"
                                            aria-label="Eliminar gasto"
                                            onClick={() => {
                                                remove.reset();
                                                setToDelete(e);
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
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Eliminar gasto"
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setToDelete(null)}
                onConfirm={() =>
                    toDelete &&
                    remove.mutate(toDelete.id, {
                        onSuccess: () => {
                            enqueueSnackbar('Gasto eliminado', { variant: 'success' });
                            setToDelete(null);
                        },
                    })
                }
            >
                {toDelete &&
                    `¿Eliminar "${toDelete.description}" (${formatMoney(toDelete.amount, toDelete.currency)}) del ${formatDate(toDelete.spentAt)}?`}
            </ConfirmDialog>
        </>
    );
}
