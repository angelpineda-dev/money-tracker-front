import { zodResolver } from '@hookform/resolvers/zod';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Controller, type DefaultValues, useForm } from 'react-hook-form';
import { errorMessage } from '@/api/errors';
import type { Transaction } from '@/api/types';
import { useAssets, useSaveTransaction } from '@/features/portfolio/queries';
import {
    type TransactionFormIn,
    type TransactionFormOut,
    TX_TYPES,
    toOptionalNumber,
    transactionSchema,
} from './schema';

const TYPE_LABEL = { COMPRA: 'Compra', VENTA: 'Venta' } as const;

function defaults(tx: Transaction | null, assetId?: number): DefaultValues<TransactionFormIn> {
    if (tx) {
        return {
            assetId: tx.assetId,
            type: tx.type,
            operatedAt: tx.operatedAt,
            quantity: tx.quantity,
            pricePerShare: tx.pricePerShare,
            fees: tx.fees,
            notes: tx.notes ?? '',
        };
    }
    return {
        assetId,
        type: 'COMPRA',
        operatedAt: dayjs().format('YYYY-MM-DD'),
        notes: '',
    };
}

export function TransactionDialog({
    open,
    transaction,
    defaultAssetId,
    onClose,
}: {
    open: boolean;
    transaction: Transaction | null;
    defaultAssetId?: number;
    onClose: () => void;
}) {
    const assets = useAssets();
    const save = useSaveTransaction();
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, watch, formState } = useForm<
        TransactionFormIn,
        unknown,
        TransactionFormOut
    >({ resolver: zodResolver(transactionSchema) });
    const { errors } = formState;

    useEffect(() => {
        if (!open) return;
        save.reset();
        reset(defaults(transaction, defaultAssetId));
    }, [open, transaction, defaultAssetId, reset, save.reset]);

    const assetId = watch('assetId');
    const currency = assets.data?.find((a) => a.id === assetId)?.currency;
    const money = currency
        ? { input: { startAdornment: <InputAdornment position="start">{currency}</InputAdornment> } }
        : undefined;
    const num = { setValueAs: toOptionalNumber } as const;

    const submit = handleSubmit((body) =>
        save.mutate(
            { id: transaction?.id, body },
            {
                onSuccess: () => {
                    enqueueSnackbar(transaction ? 'Operación actualizada' : 'Operación registrada', {
                        variant: 'success',
                    });
                    onClose();
                },
            },
        ),
    );

    return (
        <Dialog open={open} onClose={save.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form noValidate onSubmit={submit}>
                <DialogTitle>{transaction ? 'Editar operación' : 'Nueva operación'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Controller
                                control={control}
                                name="assetId"
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label="Activo"
                                        fullWidth
                                        disabled={Boolean(transaction)}
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        onBlur={field.onBlur}
                                        error={Boolean(errors.assetId)}
                                        helperText={
                                            errors.assetId?.message ??
                                            (transaction ? 'El activo no se puede cambiar' : undefined)
                                        }
                                    >
                                        {(assets.data ?? []).map((a) => (
                                            <MenuItem key={a.id} value={a.id}>
                                                {a.symbol} · {a.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                            <Controller
                                control={control}
                                name="type"
                                render={({ field }) => (
                                    <TextField select label="Tipo" sx={{ minWidth: { sm: 160 } }} {...field}>
                                        {TX_TYPES.map((t) => (
                                            <MenuItem key={t} value={t}>
                                                {TYPE_LABEL[t]}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Stack>
                        <Controller
                            control={control}
                            name="operatedAt"
                            render={({ field }) => (
                                <DatePicker
                                    label="Fecha de operación"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(v) => field.onChange(v?.isValid() ? v.format('YYYY-MM-DD') : '')}
                                    disableFuture
                                    slotProps={{
                                        textField: {
                                            error: Boolean(errors.operatedAt),
                                            helperText: errors.operatedAt?.message,
                                            onBlur: field.onBlur,
                                        },
                                    }}
                                />
                            )}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Títulos"
                                type="number"
                                fullWidth
                                {...register('quantity', num)}
                                error={Boolean(errors.quantity)}
                                helperText={errors.quantity?.message}
                                slotProps={{ htmlInput: { step: 'any', min: 0, inputMode: 'decimal' } }}
                            />
                            <TextField
                                label="Precio por título"
                                type="number"
                                fullWidth
                                {...register('pricePerShare', num)}
                                error={Boolean(errors.pricePerShare)}
                                helperText={errors.pricePerShare?.message}
                                slotProps={{ ...money, htmlInput: { step: 'any', min: 0, inputMode: 'decimal' } }}
                            />
                            <TextField
                                label="Comisión"
                                type="number"
                                fullWidth
                                {...register('fees', num)}
                                error={Boolean(errors.fees)}
                                helperText={errors.fees?.message ?? 'Opcional'}
                                slotProps={{ ...money, htmlInput: { step: 'any', min: 0, inputMode: 'decimal' } }}
                            />
                        </Stack>
                        <TextField
                            label="Notas"
                            multiline
                            minRows={2}
                            {...register('notes')}
                            error={Boolean(errors.notes)}
                            helperText={errors.notes?.message}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={save.isPending}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" loading={save.isPending}>
                        Guardar
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
