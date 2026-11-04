import { ShowChart } from '@mui/icons-material';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { Outlet } from 'react-router';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AuthLayout() {
    return (
        <Box sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', bgcolor: 'background.default', py: 4 }}>
            <Box sx={{ position: 'fixed', top: 12, right: 12 }}>
                <ThemeToggle />
            </Box>
            <Container maxWidth="xs">
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                    <ShowChart color="primary" fontSize="large" />
                    <Typography variant="h5" component="span">
                        Money Tracker
                    </Typography>
                </Stack>
                <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 } }}>
                    <Outlet />
                </Paper>
            </Container>
        </Box>
    );
}
