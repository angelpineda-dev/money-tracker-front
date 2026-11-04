import { Refresh } from '@mui/icons-material';
import { Button, Card, CardContent, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from 'notistack';
import { errorMessage } from '@/api/errors';
import { pricesApi } from '@/api/portfolio';
import { queryKeys } from '@/api/queryKeys';
import { PageHeader } from '@/components/PageHeader';

export default function AdminPage() {
    const qc = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();
    const refresh = useMutation({
        mutationFn: pricesApi.refresh,
        onSuccess: ({ updated }) => {
            enqueueSnackbar(`Precios actualizados: ${updated} ${updated === 1 ? 'activo' : 'activos'}`, {
                variant: 'success',
            });
            void qc.invalidateQueries({ queryKey: queryKeys.summary.all });
            void qc.invalidateQueries({ queryKey: queryKeys.assets.all });
        },
        onError: (error) => enqueueSnackbar(errorMessage(error), { variant: 'error' }),
    });

    return (
        <>
            <PageHeader title="Administración" />
            <Card sx={{ maxWidth: 560 }}>
                <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Precios
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Consulta Yahoo Finance y guarda el precio de hoy para todos los activos de todos los usuarios.
                        Se puede ejecutar varias veces sin duplicar datos.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        loading={refresh.isPending}
                        loadingPosition="start"
                        onClick={() => refresh.mutate()}
                    >
                        Actualizar precios
                    </Button>
                </CardContent>
            </Card>
        </>
    );
}
