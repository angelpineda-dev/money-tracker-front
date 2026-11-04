import { zodResolver } from '@hookform/resolvers/zod';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { errorMessage } from '@/api/errors';
import type { Asset, CreateAssetBody, Currency } from '@/api/types';
import { useSaveAsset } from '@/features/portfolio/queries';

const CURRENCIES = ['MXN', 'USD'] as const satisfies readonly Currency[];

export const assetSchema = z.object({
    symbol: z
        .string()
        .trim()
        .min(1, 'Requerido')
        .max(20, 'Máximo 20 caracteres')
        .transform((s) => s.toUpperCase()),
    name: z.string().trim().min(1, 'Requerido').max(120, 'Máximo 120 caracteres'),
    currency: z.enum(CURRENCIES),
}) satisfies z.ZodType<CreateAssetBody, unknown>;

type FormIn = z.input<typeof assetSchema>;
type FormOut = z.output<typeof assetSchema>;

export function AssetDialog({ open, asset, onClose }: { open: boolean; asset: Asset | null; onClose: () => void }) {
    const save = useSaveAsset();
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, formState } = useForm<FormIn, unknown, FormOut>({
        resolver: zodResolver(assetSchema),
    });

    useEffect(() => {
        if (!open) return;
        save.reset();
        reset(
            asset
                ? { symbol: asset.symbol, name: asset.name, currency: asset.currency }
                : { symbol: '', name: '', currency: 'MXN' },
        );
    }, [open, asset, reset, save.reset]);

    const submit = handleSubmit((body) =>
        save.mutate(
            { id: asset?.id, body },
            {
                onSuccess: () => {
                    enqueueSnackbar(asset ? 'Activo actualizado' : 'Activo creado', { variant: 'success' });
                    onClose();
                },
            },
        ),
    );

    return (
        <Dialog open={open} onClose={save.isPending ? undefined : onClose} maxWidth="xs" fullWidth>
            <form noValidate onSubmit={submit}>
                <DialogTitle>{asset ? 'Editar activo' : 'Nuevo activo'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <TextField
                            label="Símbolo"
                            placeholder="CUERVO.MX"
                            autoFocus
                            {...register('symbol')}
                            error={Boolean(formState.errors.symbol)}
                            helperText={formState.errors.symbol?.message ?? 'Como aparece en Yahoo Finance'}
                            slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                        />
                        <TextField
                            label="Nombre"
                            {...register('name')}
                            error={Boolean(formState.errors.name)}
                            helperText={formState.errors.name?.message}
                        />
                        <Controller
                            control={control}
                            name="currency"
                            render={({ field }) => (
                                <TextField select label="Moneda" {...field}>
                                    {CURRENCIES.map((c) => (
                                        <MenuItem key={c} value={c}>
                                            {c}
                                        </MenuItem>
                                    ))}
                                </TextField>
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
