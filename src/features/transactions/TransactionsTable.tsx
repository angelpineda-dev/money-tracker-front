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
import type { Transaction } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useDeleteTransaction } from '@/features/portfolio/queries';
import { formatDate, formatMoney } from '@/lib/format';

const qty = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 6 });

export function TransactionsTable({
    rows,
    onEdit,
    showAsset = true,
}: {
    rows: Transaction[];
    onEdit: (tx: Transaction) => void;
    showAsset?: boolean;
}) {
    const remove = useDeleteTransaction();
    const { enqueueSnackbar } = useSnackbar();
    const [toDelete, setToDelete] = useState<Transaction | null>(null);

    if (rows.length === 0) {
        return (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No hay operaciones con estos filtros.
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
                            {showAsset && <TableCell>Activo</TableCell>}
                            <TableCell>Tipo</TableCell>
                            <TableCell align="right">Títulos</TableCell>
                            <TableCell align="right">Precio</TableCell>
                            <TableCell align="right">Comisión</TableCell>
                            <TableCell align="right">IVA</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell>Notas</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((t) => {
                            const c = t.asset.currency;
                            const costs = t.fees + t.iva;
                            const total = t.quantity * t.pricePerShare + (t.type === 'COMPRA' ? costs : -costs);
                            return (
                                <TableRow key={t.id} hover>
                                    <TableCell>{formatDate(t.operatedAt)}</TableCell>
                                    {showAsset && <TableCell sx={{ fontWeight: 600 }}>{t.asset.symbol}</TableCell>}
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={t.type === 'COMPRA' ? 'Compra' : 'Venta'}
                                            color={t.type === 'COMPRA' ? 'success' : 'warning'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">{qty.format(t.quantity)}</TableCell>
                                    <TableCell align="right">{formatMoney(t.pricePerShare, c)}</TableCell>
                                    <TableCell align="right">{formatMoney(t.fees, c)}</TableCell>
                                    <TableCell align="right">{formatMoney(t.iva, c)}</TableCell>
                                    <TableCell align="right">{formatMoney(total, c)}</TableCell>
                                    <TableCell
                                        sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        title={t.notes ?? ''}
                                    >
                                        {t.notes}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton
                                                size="small"
                                                aria-label="Editar operación"
                                                onClick={() => onEdit(t)}
                                            >
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                size="small"
                                                aria-label="Eliminar operación"
                                                onClick={() => {
                                                    remove.reset();
                                                    setToDelete(t);
                                                }}
                                            >
                                                <DeleteOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Eliminar operación"
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setToDelete(null)}
                onConfirm={() =>
                    toDelete &&
                    remove.mutate(toDelete.id, {
                        onSuccess: () => {
                            enqueueSnackbar('Operación eliminada', { variant: 'success' });
                            setToDelete(null);
                        },
                    })
                }
            >
                {toDelete &&
                    `¿Eliminar la ${toDelete.type === 'COMPRA' ? 'compra' : 'venta'} de ${qty.format(toDelete.quantity)} ${toDelete.asset.symbol} del ${formatDate(toDelete.operatedAt)}?`}
            </ConfirmDialog>
        </>
    );
}
