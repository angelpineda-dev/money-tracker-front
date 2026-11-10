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
import { CURRENCIES, type Currency, type Expense } from '@/api/types';
import { toOptionalNumber } from '@/features/transactions/schema';
import { useExpenseCategories, useSaveExpense } from './queries';
import { type ExpenseFormIn, type ExpenseFormOut, expenseSchema } from './schema';

/** Debt being paid: the expense becomes an abono, locked to the debt's currency. */
export interface DebtTarget {
    id: number;
    name: string;
    currency: Currency;
}

function defaults(expense: Expense | null, debt?: DebtTarget): DefaultValues<ExpenseFormIn> {
    if (expense) {
        return {
            categoryId: expense.categoryId,
            amount: expense.amount,
            currency: expense.currency,
            spentAt: expense.spentAt,
            description: expense.description,
            notes: expense.notes ?? '',
            debtId: expense.debtId ?? undefined,
        };
    }
    return {
        currency: debt?.currency ?? 'MXN',
        spentAt: dayjs().format('YYYY-MM-DD'),
        description: debt ? `Abono a ${debt.name}` : '',
        notes: '',
        debtId: debt?.id,
    };
}

export function ExpenseDialog({
    open,
    expense,
    debt,
    onClose,
}: {
    open: boolean;
    expense: Expense | null;
    debt?: DebtTarget;
    onClose: () => void;
}) {
    const categories = useExpenseCategories();
    const save = useSaveExpense();
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, watch, formState } = useForm<
        ExpenseFormIn,
        unknown,
        ExpenseFormOut
    >({ resolver: zodResolver(expenseSchema) });
    const { errors } = formState;

    useEffect(() => {
        if (!open) return;
        save.reset();
        reset(defaults(expense, debt));
    }, [open, expense, debt, reset, save.reset]);

    const currency = watch('currency');
    const linkedToDebt = watch('debtId') !== undefined;

    const submit = handleSubmit((body) =>
        save.mutate(
            // Editing: an emptied note must clear the stored one, not be left untouched.
            { id: expense?.id, body: expense ? { ...body, notes: body.notes ?? null } : body },
            {
                onSuccess: () => {
                    enqueueSnackbar(expense ? 'Gasto actualizado' : 'Gasto registrado', { variant: 'success' });
                    onClose();
                },
            },
        ),
    );

    return (
        <Dialog open={open} onClose={save.isPending ? undefined : onClose} maxWidth="sm" fullWidth>
            <form noValidate onSubmit={submit}>
                <DialogTitle>{debt ? `Abono a ${debt.name}` : expense ? 'Editar gasto' : 'Nuevo gasto'}</DialogTitle>
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
                                    <TextField
                                        select
                                        label="Moneda"
                                        sx={{ minWidth: { sm: 120 } }}
                                        disabled={linkedToDebt}
                                        {...field}
                                    >
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
                            name="categoryId"
                            render={({ field }) => (
                                <TextField
                                    select
                                    label="Categoría"
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
                        <Controller
                            control={control}
                            name="spentAt"
                            render={({ field }) => (
                                <DatePicker
                                    label="Fecha"
                                    value={field.value ? dayjs(field.value) : null}
                                    onChange={(v) => field.onChange(v?.isValid() ? v.format('YYYY-MM-DD') : '')}
                                    disableFuture
                                    slotProps={{
                                        textField: {
                                            error: Boolean(errors.spentAt),
                                            helperText: errors.spentAt?.message,
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
