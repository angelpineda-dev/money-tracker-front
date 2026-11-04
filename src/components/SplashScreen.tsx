import { Box, CircularProgress, Typography } from '@mui/material';

export function SplashScreen() {
    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}
        >
            <Box sx={{ textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }} color="text.secondary">
                    Cargando…
                </Typography>
            </Box>
        </Box>
    );
}
