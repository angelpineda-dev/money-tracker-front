import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { errorMessage } from '@/api/errors';
import type { ExpenseCategory } from '@/api/types';
import { useSaveCategory } from '@/features/expenses/queries';
import { type CategoryFormIn, type CategoryFormOut, categorySchema } from '@/features/expenses/schema';

export function CategoryDialog({
    open,
    category,
    onClose,
}: {
    open: boolean;
    category: ExpenseCategory | null;
    onClose: () => void;
}) {
    const save = useSaveCategory();
    const { enqueueSnackbar } = useSnackbar();
    const { register, handleSubmit, reset, formState } = useForm<CategoryFormIn, unknown, CategoryFormOut>({
        resolver: zodResolver(categorySchema),
    });
    const { errors } = formState;

    useEffect(() => {
        if (!open) return;
        save.reset();
        reset({ name: category?.name ?? '', color: category?.color ?? '' });
    }, [open, category, reset, save.reset]);

    const submit = handleSubmit((body) =>
        save.mutate(
            // Editing: an emptied color must clear the stored one.
            { id: category?.id, body: category ? { ...body, color: body.color ?? null } : body },
            {
                onSuccess: () => {
                    enqueueSnackbar(category ? 'Categoría actualizada' : 'Categoría creada', { variant: 'success' });
                    onClose();
                },
            },
        ),
    );

    return (
        <Dialog open={open} onClose={save.isPending ? undefined : onClose} maxWidth="xs" fullWidth>
            <form noValidate onSubmit={submit}>
                <DialogTitle>{category ? 'Editar categoría' : 'Nueva categoría'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <TextField
                            label="Nombre"
                            autoFocus
                            {...register('name')}
                            error={Boolean(errors.name)}
                            helperText={errors.name?.message}
                        />
                        <TextField
                            label="Color"
                            placeholder="#ff8800"
                            {...register('color')}
                            error={Boolean(errors.color)}
                            helperText={errors.color?.message ?? 'Opcional, formato #RRGGBB'}
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
