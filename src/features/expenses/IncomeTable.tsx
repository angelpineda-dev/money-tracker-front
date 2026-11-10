import { DeleteOutlined, EditOutlined } from '@mui/icons-material';
import {
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
import type { Income } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { formatDate, formatMoney } from '@/lib/format';
import { useDeleteIncome } from './queries';

export function IncomeTable({ rows, onEdit }: { rows: Income[]; onEdit: (income: Income) => void }) {
    const remove = useDeleteIncome();
    const { enqueueSnackbar } = useSnackbar();
    const [toDelete, setToDelete] = useState<Income | null>(null);

    if (rows.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No hay ingresos con estos filtros.
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
                            <TableCell align="right">Monto</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((i) => (
                            <TableRow key={i.id} hover>
                                <TableCell>{formatDate(i.receivedAt)}</TableCell>
                                <TableCell
                                    sx={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                    title={i.notes ?? ''}
                                >
                                    {i.description}
                                </TableCell>
                                <TableCell align="right">{formatMoney(i.amount, i.currency)}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Editar">
                                        <IconButton size="small" aria-label="Editar ingreso" onClick={() => onEdit(i)}>
                                            <EditOutlined fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Eliminar">
                                        <IconButton
                                            size="small"
                                            aria-label="Eliminar ingreso"
                                            onClick={() => {
                                                remove.reset();
                                                setToDelete(i);
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
                title="Eliminar ingreso"
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setToDelete(null)}
                onConfirm={() =>
                    toDelete &&
                    remove.mutate(toDelete.id, {
                        onSuccess: () => {
                            enqueueSnackbar('Ingreso eliminado', { variant: 'success' });
                            setToDelete(null);
                        },
                    })
                }
            >
                {toDelete &&
                    `¿Eliminar "${toDelete.description}" (${formatMoney(toDelete.amount, toDelete.currency)}) del ${formatDate(toDelete.receivedAt)}?`}
            </ConfirmDialog>
        </>
    );
}
