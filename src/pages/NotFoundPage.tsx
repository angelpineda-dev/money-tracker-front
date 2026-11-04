import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

export default function NotFoundPage() {
    return (
        <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', textAlign: 'center', p: 2 }}>
            <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    404
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    La página que buscas no existe.
                </Typography>
                <Button component={RouterLink} to="/dashboard" variant="contained">
                    Ir al resumen
                </Button>
            </Box>
        </Box>
    );
}
