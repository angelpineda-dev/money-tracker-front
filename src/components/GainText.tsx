import { Typography, type TypographyProps } from '@mui/material';

export function GainText({ value, children, ...props }: { value: number | null } & TypographyProps) {
    const color = value === null || value === 0 ? 'text.primary' : value > 0 ? 'success.main' : 'error.main';
    return (
        <Typography component="span" variant="inherit" color={color} sx={{ fontWeight: 600 }} {...props}>
            {children}
        </Typography>
    );
}
