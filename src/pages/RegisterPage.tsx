import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router';
import { authApi } from '@/api/auth';
import { errorMessage } from '@/api/errors';
import { type RegisterValues, registerSchema } from '@/features/auth/schemas';
import { startSession } from '@/hooks/useSession';

export default function RegisterPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: '', name: '', password: '', confirmed_password: '' },
    });
    const signUp = useMutation({
        mutationFn: async (values: RegisterValues) => {
            await authApi.register(values);
            await startSession({ email: values.email, password: values.password });
        },
    });

    return (
        <form noValidate onSubmit={handleSubmit((values) => signUp.mutate(values))}>
            <Stack spacing={2.5}>
                <div>
                    <Typography variant="h5" component="h1">
                        Crear cuenta
                    </Typography>
                    <Typography color="text.secondary">Empieza a registrar tus inversiones</Typography>
                </div>
                {signUp.isError && <Alert severity="error">{errorMessage(signUp.error)}</Alert>}
                <TextField
                    label="Nombre"
                    autoComplete="name"
                    autoFocus
                    {...register('name')}
                    error={Boolean(errors.name)}
                    helperText={errors.name?.message}
                />
                <TextField
                    label="Correo"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                />
                <TextField
                    label="Contraseña"
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message ?? 'Mínimo 8 caracteres, una mayúscula y un número'}
                />
                <TextField
                    label="Confirmar contraseña"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmed_password')}
                    error={Boolean(errors.confirmed_password)}
                    helperText={errors.confirmed_password?.message}
                />
                <Button type="submit" variant="contained" size="large" loading={signUp.isPending}>
                    Crear cuenta
                </Button>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    ¿Ya tienes cuenta?{' '}
                    <Link component={RouterLink} to="/login">
                        Inicia sesión
                    </Link>
                </Typography>
            </Stack>
        </form>
    );
}
