import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { errorMessage } from '@/api/errors';
import { queryKeys } from '@/api/queryKeys';
import { userApi } from '@/api/user';
import { queryClient } from '@/app/queryClient';
import { useAuthStore } from '@/stores/authStore';
import { type ProfileValues, profileSchema } from './schemas';

export function ProfileCard() {
    const me = useQuery({ queryKey: queryKeys.me, queryFn: userApi.me });
    const { enqueueSnackbar } = useSnackbar();
    const { register, handleSubmit, reset, formState } = useForm<ProfileValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: '' },
    });

    useEffect(() => {
        if (me.data) reset({ name: me.data.name });
    }, [me.data, reset]);

    const save = useMutation({
        mutationFn: userApi.update,
        onSuccess: async () => {
            const user = await queryClient.fetchQuery({ queryKey: queryKeys.me, queryFn: userApi.me, staleTime: 0 });
            useAuthStore.getState().setUser(user);
            enqueueSnackbar('Perfil actualizado', { variant: 'success' });
        },
    });

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                    Perfil
                </Typography>
                <form noValidate onSubmit={handleSubmit((v) => save.mutate(v))}>
                    <Stack spacing={2}>
                        {save.isError && <Alert severity="error">{errorMessage(save.error)}</Alert>}
                        <TextField label="Correo" value={me.data?.email ?? ''} disabled />
                        <TextField
                            label="Nombre"
                            {...register('name')}
                            error={Boolean(formState.errors.name)}
                            helperText={formState.errors.name?.message}
                        />
                        <Stack direction="row">
                            <Button
                                type="submit"
                                variant="contained"
                                loading={save.isPending}
                                disabled={!formState.isDirty}
                            >
                                Guardar
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </CardContent>
        </Card>
    );
}
