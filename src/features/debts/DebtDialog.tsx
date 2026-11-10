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
import { Controller, useForm } from 'react-hook-form';
import { errorMessage } from '@/api/errors';
import { CURRENCIES, type Debt } from '@/api/types';
import { useSaveDebt } from '@/features/expenses/queries';
import { type DebtFormIn, type DebtFormOut, debtSchema } from '@/features/expenses/schema';
import { toOptionalNumber } from '@/features/transactions/schema';

export function DebtDialog({ open, debt, onClose }: { open: boolean; debt: Debt | null; onClose: () => void }) {
    const save = useSaveDebt();
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, watch, formState } = useForm<DebtFormIn, unknown, DebtFormOut>({
        resolver: zodResolver(debtSchema),
    });
    const { errors } = formState;

    useEffect(() => {
        if (!open) return;
        save.reset();
        reset(
            debt
                ? {
                      name: debt.name,
                      creditor: debt.creditor ?? '',
                      totalAmount: debt.totalAmount,
                      currency: debt.currency,
                      dueDate: debt.dueDate ?? '',
                  }
                : { name: '', creditor: '', currency: 'MXN', dueDate: '' },
        );
    }, [open, debt, reset, save.reset]);

    const currency = watch('currency');

    const submit = handleSubmit((body) =>
        save.mutate(
            {
                id: debt?.id,
                // Editing: emptied optional fields must clear the stored values.
                body: debt ? { ...body, creditor: body.creditor ?? null, dueDate: body.dueDate ?? null } : body,
            },
            {
                onSuccess: () => {
                    enqueueSnackbar(debt ? 'Deuda actualizada' : 'Deuda registrada', { variant: 'success' });
                    onClose();
                },
            },
        ),
    );

    return (
        <Dialog open={open} onClose={save.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form noValidate onSubmit={submit}>
                <DialogTitle>{debt ? 'Editar deuda' : 'Nueva deuda'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <TextField
                            label="Nombre"
                            {...register('name')}
                            error={Boolean(errors.name)}
                            helperText={errors.name?.message}
                        />
                        <TextField
                            label="Acreedor"
                            {...register('creditor')}
                            error={Boolean(errors.creditor)}
                            helperText={errors.creditor?.message ?? 'Opcional'}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Monto total"
                                type="number"
                                fullWidth
                                {...register('totalAmount', { setValueAs: toOptionalNumber })}
                                error={Boolean(errors.totalAmount)}
                                helperText={errors.totalAmount?.message}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start">{currency}</InputAdornment>,
                                    },
                                    htmlInput: { step: 'any', min: 0, inputMode: 'decimal' },
                                }}
                            />
                            <Controller
                                control={control}
                                name="currency"
                                render={({ field }) => (
                                    <TextField select label="Moneda" sx={{ minWidth: { sm: 120 } }} {...field}>
                                        {CURRENCIES.map((c) => (
                                            <MenuItem key={c} value={c}>
                                                {c}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Stack>
                        <Controller
                            control={control}
                            name="dueDate"
                            render={({ field }) => (
                                <DatePicker
                                    label="Fecha límite"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(v) => field.onChange(v?.isValid() ? v.format('YYYY-MM-DD') : '')}
                                    slotProps={{
                                        field: { clearable: true },
                                        textField: {
                                            error: Boolean(errors.dueDate),
                                            helperText: errors.dueDate?.message ?? 'Opcional',
                                            onBlur: field.onBlur,
                                        },
                                    }}
                                />
                            )}
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
