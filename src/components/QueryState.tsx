import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { errorMessage } from '@/api/errors';

/** Loading / error placeholder for a query section. Renders nothing once data is there. */
export function QueryState({
    isPending,
    error,
    onRetry,
}: {
    isPending: boolean;
    error: unknown;
    onRetry?: () => void;
}) {
    if (isPending) {
        return (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
                <CircularProgress aria-label="Cargando" />
            </Box>
        );
    }
    if (error) {
        return (
            <Alert
                severity="error"
                action={
                    onRetry && (
                        <Button color="inherit" size="small" onClick={onRetry}>
                            Reintentar
                        </Button>
                    )
                }
            >
                {errorMessage(error)}
            </Alert>
        );
    }
    return null;
}
