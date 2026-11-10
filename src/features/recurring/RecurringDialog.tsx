import { zodResolver } from '@hookform/resolvers/zod';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Stack,
    Switch,
    TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Controller, type DefaultValues, useForm } from 'react-hook-form';
import { errorMessage } from '@/api/errors';
import { CURRENCIES, FREQUENCIES, type RecurringPayment } from '@/api/types';
import { useExpenseCategories, useSaveRecurring } from '@/features/expenses/queries';
import {
    FREQUENCY_LABEL,
    type RecurringFormIn,
    type RecurringFormOut,
    recurringSchema,
} from '@/features/expenses/schema';
import { toOptionalNumber } from '@/features/transactions/schema';

function defaults(payment: RecurringPayment | null): DefaultValues<RecurringFormIn> {
    if (payment) {
        return {
            categoryId: payment.categoryId,
            name: payment.name,
            amount: payment.amount,
            currency: payment.currency,
            frequency: payment.frequency,
            nextRunAt: payment.nextRunAt,
            active: payment.active,
        };
    }
    return { name: '', currency: 'MXN', frequency: 'MONTHLY', nextRunAt: dayjs().format('YYYY-MM-DD'), active: true };
}

export function RecurringDialog({
    open,
    payment,
    onClose,
}: {
    open: boolean;
    payment: RecurringPayment | null;
    onClose: () => void;
}) {
    const categories = useExpenseCategories();
    const save = useSaveRecurring();
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, watch, formState } = useForm<
        RecurringFormIn,
        unknown,
        RecurringFormOut
    >({ resolver: zodResolver(recurringSchema) });
    const { errors } = formState;

    useEffect(() => {
        if (!open) return;
        save.reset();
        reset(defaults(payment));
    }, [open, payment, reset, save.reset]);

    const currency = watch('currency');

    const submit = handleSubmit((body) =>
        save.mutate(
            { id: payment?.id, body },
            {
                onSuccess: () => {
                    enqueueSnackbar(payment ? 'Pago recurrente actualizado' : 'Pago recurrente creado', {
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
                <DialogTitle>{payment ? 'Editar pago recurrente' : 'Nuevo pago recurrente'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <TextField
                            label="Nombre"
                            {...register('name')}
                            error={Boolean(errors.name)}
                            helperText={errors.name?.message}
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
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Controller
                                control={control}
                                name="frequency"
                                render={({ field }) => (
                                    <TextField select label="Frecuencia" fullWidth {...field}>
                                        {FREQUENCIES.map((f) => (
                                            <MenuItem key={f} value={f}>
                                                {FREQUENCY_LABEL[f]}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                            <Controller
                                control={control}
                                name="categoryId"
                                render={({ field }) => (
                                    <TextField
                                        select
                                        label="Categoría"
                                        fullWidth
                                        value={field.value ?? ''}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        onBlur={field.onBlur}
                                        error={Boolean(errors.categoryId)}
                                        helperText={errors.categoryId?.message}
                                    >
                                        {(categories.data ?? []).map((c) => (
                                            <MenuItem key={c.id} value={c.id}>
                                                {c.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Stack>
                        <Controller
                            control={control}
                            name="nextRunAt"
                            render={({ field }) => (
                                <DatePicker
                                    label="Próximo cobro"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(v) => field.onChange(v?.isValid() ? v.format('YYYY-MM-DD') : '')}
                                    slotProps={{
                                        textField: {
                                            error: Boolean(errors.nextRunAt),
                                            helperText:
                                                errors.nextRunAt?.message ??
                                                'Ese día se genera el gasto. Si la fecha ya pasó, los atrasados se generan en la próxima corrida diaria',
                                            onBlur: field.onBlur,
                                        },
                                    }}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="active"
                            render={({ field }) => (
                                <FormControlLabel
                                    control={<Switch checked={Boolean(field.value)} onChange={field.onChange} />}
                                    label="Activo"
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
