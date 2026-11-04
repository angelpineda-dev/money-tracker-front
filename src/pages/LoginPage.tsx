import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router';
import { errorMessage } from '@/api/errors';
import { type LoginValues, loginSchema } from '@/features/auth/schemas';
import { startSession } from '@/hooks/useSession';

export default function LoginPage() {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
    const login = useMutation({ mutationFn: startSession });

    return (
        <form noValidate onSubmit={handleSubmit((values) => login.mutate(values))}>
            <Stack spacing={2.5}>
                <div>
                    <Typography variant="h5" component="h1">
                        Iniciar sesión
                    </Typography>
                    <Typography color="text.secondary">Bienvenido de nuevo</Typography>
                </div>
                {login.isError && <Alert severity="error">{errorMessage(login.error)}</Alert>}
                <TextField
                    label="Correo"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    {...register('email')}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                />
                <TextField
                    label="Contraseña"
                    type="password"
                    autoComplete="current-password"
                    {...register('password')}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                />
                <Button type="submit" variant="contained" size="large" loading={login.isPending}>
                    Entrar
                </Button>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                    ¿No tienes cuenta?{' '}
                    <Link component={RouterLink} to="/register">
                        Regístrate
                    </Link>
                </Typography>
            </Stack>
        </form>
    );
}
