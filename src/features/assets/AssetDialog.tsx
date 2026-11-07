import { zodResolver } from '@hookform/resolvers/zod';
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { errorMessage } from '@/api/errors';
import type { Asset, CreateAssetBody, Currency, SymbolMatch } from '@/api/types';
import { useSaveAsset } from '@/features/portfolio/queries';
import { SYMBOL_SEARCH_MIN_CHARS, useSymbolSearch } from './useSymbolSearch';

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

const SYMBOL_HINT = 'Como aparece en Yahoo Finance';

export function AssetDialog({ open, asset, onClose }: { open: boolean; asset: Asset | null; onClose: () => void }) {
    const save = useSaveAsset();
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, setValue, getValues, formState } = useForm<
        FormIn,
        unknown,
        FormOut
    >({
        resolver: zodResolver(assetSchema),
    });

    const isCreate = asset === null;
    // Currency comes from Yahoo once a search result is picked; typing a symbol by hand frees it again.
    const [currencyLocked, setCurrencyLocked] = useState(false);
    // Name we filled in from a result, so picking another result replaces it but a user-typed name stays.
    const autoName = useRef<string | null>(null);

    const symbolInput = useWatch({ control, name: 'symbol' }) ?? '';
    const search = useSymbolSearch(symbolInput, open && isCreate && !currencyLocked);

    useEffect(() => {
        if (!open) return;
        save.reset();
        setCurrencyLocked(false);
        autoName.current = null;
        reset(
            asset
                ? { symbol: asset.symbol, name: asset.name, currency: asset.currency }
                : { symbol: '', name: '', currency: 'MXN' },
        );
    }, [open, asset, reset, save.reset]);

    const pick = (match: SymbolMatch) => {
        setValue('symbol', match.symbol, { shouldValidate: true });
        const name = getValues('name');
        if (!name || name === autoName.current) {
            setValue('name', match.name, { shouldValidate: true });
            autoName.current = match.name;
        }
        setValue('currency', match.currency);
        setCurrencyLocked(true);
    };

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

    const searchHelper = search.isError
        ? errorMessage(search.error)
        : 'Busca por símbolo o nombre; se identifica la moneda';

    return (
        <Dialog open={open} onClose={save.isPending ? undefined : onClose} maxWidth="xs" fullWidth>
            <form noValidate onSubmit={submit}>
                <DialogTitle>{asset ? 'Editar activo' : 'Nuevo activo'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        {isCreate ? (
                            <Controller
                                control={control}
                                name="symbol"
                                render={({ field, fieldState }) => (
                                    <Autocomplete<SymbolMatch, false, false, true>
                                        freeSolo
                                        options={search.active ? (search.data ?? []) : []}
                                        // The backend already matched and filtered; don't filter again client-side.
                                        filterOptions={(options) => options}
                                        getOptionLabel={(o) => (typeof o === 'string' ? o : o.symbol)}
                                        isOptionEqualToValue={(o, v) =>
                                            o.symbol === (typeof v === 'string' ? v : v.symbol)
                                        }
                                        inputValue={field.value ?? ''}
                                        onInputChange={(_, value, reason) => {
                                            if (reason === 'reset') return;
                                            field.onChange(value);
                                            setCurrencyLocked(false);
                                        }}
                                        onChange={(_, value) => {
                                            if (value && typeof value !== 'string') pick(value);
                                        }}
                                        loading={search.pending}
                                        loadingText="Buscando…"
                                        noOptionsText={
                                            search.active
                                                ? 'Sin coincidencias en MXN/USD'
                                                : 'Escribe al menos 2 caracteres'
                                        }
                                        renderOption={({ key, ...props }, o) => (
                                            <Box component="li" key={key} {...props}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ width: '100%', alignItems: 'center' }}
                                                >
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                            {o.symbol}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            noWrap
                                                            component="p"
                                                        >
                                                            {o.name} · {o.exchange}
                                                        </Typography>
                                                    </Box>
                                                    <Chip label={o.currency} size="small" variant="outlined" />
                                                </Stack>
                                            </Box>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Símbolo"
                                                placeholder="CUERVO.MX"
                                                autoFocus
                                                inputRef={field.ref}
                                                onBlur={field.onBlur}
                                                error={Boolean(fieldState.error)}
                                                helperText={
                                                    fieldState.error?.message ??
                                                    (symbolInput.trim().length >= SYMBOL_SEARCH_MIN_CHARS ||
                                                    search.isError
                                                        ? searchHelper
                                                        : SYMBOL_HINT)
                                                }
                                                slotProps={{
                                                    ...params.slotProps,
                                                    htmlInput: {
                                                        ...params.slotProps.htmlInput,
                                                        style: { textTransform: 'uppercase' },
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                )}
                            />
                        ) : (
                            <TextField
                                label="Símbolo"
                                placeholder="CUERVO.MX"
                                autoFocus
                                {...register('symbol')}
                                error={Boolean(formState.errors.symbol)}
                                helperText={formState.errors.symbol?.message ?? SYMBOL_HINT}
                                slotProps={{ htmlInput: { style: { textTransform: 'uppercase' } } }}
                            />
                        )}
                        <TextField
                            label="Nombre"
                            {...register('name')}
                            error={Boolean(formState.errors.name)}
                            helperText={formState.errors.name?.message}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        <Controller
                            control={control}
                            name="currency"
                            render={({ field }) => (
                                <TextField
                                    select
                                    label="Moneda"
                                    {...field}
                                    disabled={currencyLocked}
                                    helperText={currencyLocked ? 'Detectada desde Yahoo Finance' : undefined}
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
