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
import { CURRENCIES, type Income } from '@/api/types';
import { toOptionalNumber } from '@/features/transactions/schema';
import { useSaveIncome } from './queries';
import { type IncomeFormIn, type IncomeFormOut, incomeSchema } from './schema';

function defaults(income: Income | null): DefaultValues<IncomeFormIn> {
    if (income) {
        return {
            amount: income.amount,
            currency: income.currency,
            receivedAt: income.receivedAt,
            description: income.description,
            notes: income.notes ?? '',
        };
    }
    return { currency: 'MXN', receivedAt: dayjs().format('YYYY-MM-DD'), description: '', notes: '' };
}

export function IncomeDialog({ open, income, onClose }: { open: boolean; income: Income | null; onClose: () => void }) {
    const save = useSaveIncome();
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, watch, formState } = useForm<IncomeFormIn, unknown, IncomeFormOut>({
        resolver: zodResolver(incomeSchema),
    });
    const { errors } = formState;

    useEffect(() => {
        if (!open) return;
        save.reset();
        reset(defaults(income));
    }, [open, income, reset, save.reset]);

    const currency = watch('currency');

    const submit = handleSubmit((body) =>
        save.mutate(
            // Editing: an emptied note must clear the stored one, not be left untouched.
            { id: income?.id, body: income ? { ...body, notes: body.notes ?? null } : body },
            {
                onSuccess: () => {
                    enqueueSnackbar(income ? 'Ingreso actualizado' : 'Ingreso registrado', { variant: 'success' });
                    onClose();
                },
            },
        ),
    );

    return (
        <Dialog open={open} onClose={save.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form noValidate onSubmit={submit}>
                <DialogTitle>{income ? 'Editar ingreso' : 'Nuevo ingreso'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <TextField
                            label="Descripción"
                            {...register('description')}
                            error={Boolean(errors.description)}
                            helperText={errors.description?.message}
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Monto"
                                type="number"
                                fullWidth
                                {...register('amount', { setValueAs: toOptionalNumber })}
                                error={Boolean(errors.amount)}
                                helperText={errors.amount?.message}
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
                            name="receivedAt"
                            render={({ field }) => (
                                <DatePicker
                                    label="Fecha"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(v) => field.onChange(v?.isValid() ? v.format('YYYY-MM-DD') : '')}
                                    disableFuture
                                    slotProps={{
                                        textField: {
                                            error: Boolean(errors.receivedAt),
                                            helperText: errors.receivedAt?.message,
                                            onBlur: field.onBlur,
                                        },
                                    }}
                                />
                            )}
                        />
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
