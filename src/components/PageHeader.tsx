import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 3,
            }}
        >
            <Box>
                <Typography variant="h4" component="h1">
                    {title}
                </Typography>
                {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
            </Box>
            {action}
        </Box>
    );
}
