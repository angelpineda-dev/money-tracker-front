import { zodResolver } from '@hookform/resolvers/zod';
import {
    Alert,
    Button,
    Card,
    CardContent,
    Checkbox,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { errorMessage } from '@/api/errors';
import { userApi } from '@/api/user';
import { type ChangePasswordValues, changePasswordSchema } from './schemas';

const EMPTY: ChangePasswordValues = {
    current_password: '',
    new_password: '',
    confirmed_password: '',
    close_sessions: false,
};

export function PasswordCard() {
    const { enqueueSnackbar } = useSnackbar();
    const { register, control, handleSubmit, reset, formState } = useForm<ChangePasswordValues>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: EMPTY,
    });
    const { errors } = formState;
    const save = useMutation({
        mutationFn: userApi.changePassword,
        onSuccess: () => {
            reset(EMPTY);
            enqueueSnackbar('Contraseña actualizada', { variant: 'success' });
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                    Contraseña
                </Typography>
                <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
                    <Stack spacing={2}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <TextField
                            label="Contraseña actual"
                            type="password"
                            autoComplete="current-password"
                            {...register('current_password')}
                            error={Boolean(errors.current_password)}
                            helperText={errors.current_password?.message}
                        />
                        <TextField
                            label="Nueva contraseña"
                            type="password"
                            autoComplete="new-password"
                            {...register('new_password')}
                            error={Boolean(errors.new_password)}
                            helperText={
                                errors.new_password?.message ?? 'Mínimo 8 caracteres, una mayúscula y un número'
                            }
                        />
                        <TextField
                            label="Confirmar nueva contraseña"
                            type="password"
                            autoComplete="new-password"
                            {...register('confirmed_password')}
                            error={Boolean(errors.confirmed_password)}
                            helperText={errors.confirmed_password?.message}
                        />
                        <Controller
                            control={control}
                            name="close_sessions"
                            render={({ field }) => (
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={field.value}
                                            onChange={(e) => field.onChange(e.target.checked)}
                                        />
                                    }
                                    label="Cerrar otras sesiones"
                                />
                            )}
                        />
                        <Stack direction="row">
                            <Button type="submit" variant="contained" loading={save.isPending}>
                                Cambiar contraseña
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
}
