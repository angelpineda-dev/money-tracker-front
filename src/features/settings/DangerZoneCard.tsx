import { Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { endSession } from '@/api/client';
import { errorMessage } from '@/api/errors';
import { userApi } from '@/api/user';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useLogout } from '@/hooks/useSession';

export function DangerZoneCard() {
    const logout = useLogout();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [dialog, setDialog] = useState<'logoutAll' | 'delete' | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);
    const remove = useMutation({
        mutationFn: userApi.remove,
        onSuccess: () => {
            endSession(false);
            enqueueSnackbar('Tu cuenta fue eliminada', { variant: 'info' });
            navigate('/login', { replace: true });
        },
    });

    return (
        <Card sx={{ borderColor: 'error.main' }}>
            <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                    Sesiones y cuenta
                </Typography>
                <Stack spacing={2} divider={<Divider flexItem />}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                        <div>
                            <Typography sx={{ fontWeight: 600 }}>Cerrar sesión en todos los dispositivos</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Incluye esta sesión. Tendrás que volver a iniciar sesión.
                            </Typography>
                        </div>
                        <Button variant="outlined" onClick={() => setDialog('logoutAll')} sx={{ flexShrink: 0 }}>
                            Cerrar todas
                        </Button>
                    </Stack>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
                        <div>
                            <Typography sx={{ fontWeight: 600 }}>Eliminar cuenta</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tu cuenta se desactiva y se cierran todas tus sesiones.
                            </Typography>
                        </div>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                remove.reset();
                                setDialog('delete');
                            }}
                            sx={{ flexShrink: 0 }}
                        >
                            Eliminar cuenta
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
            <ConfirmDialog
                open={dialog === 'logoutAll'}
                title="Cerrar todas las sesiones"
                confirmLabel="Cerrar todas"
                loading={loggingOut}
                onClose={() => setDialog(null)}
                onConfirm={async () => {
                    setLoggingOut(true);
                    await logout(true);
                }}
            >
                Se cerrará la sesión en todos tus dispositivos, incluido este.
            </ConfirmDialog>
            <ConfirmDialog
                open={dialog === 'delete'}
                title="Eliminar cuenta"
                confirmLabel="Eliminar mi cuenta"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setDialog(null)}
                onConfirm={() => remove.mutate()}
            >
                ¿Seguro que quieres eliminar tu cuenta? No podrás volver a iniciar sesión con ella.
            </ConfirmDialog>
        </Card>
    );
}
