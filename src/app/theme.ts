import { esES } from '@mui/material/locale';
import { createTheme } from '@mui/material/styles';
import { esES as datePickersEs } from '@mui/x-date-pickers/locales';
import type { ThemeMode } from '@/stores/uiStore';

export function buildTheme(mode: ThemeMode) {
    return createTheme(
        {
            palette: {
                mode,
                primary: { main: mode === 'dark' ? '#5eb3a0' : '#1f6f5c' },
                secondary: { main: mode === 'dark' ? '#e0b45c' : '#a86b12' },
                background: mode === 'dark' ? { default: '#0f1413', paper: '#161d1b' } : { default: '#f5f7f6' },
            },
            shape: { borderRadius: 10 },
            typography: {
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                h4: { fontWeight: 700 },
                h5: { fontWeight: 700 },
            },
            components: {
                MuiButton: {
                    defaultProps: { disableElevation: true },
                    styleOverrides: { root: { textTransform: 'none' } },
                },
                MuiPaper: { defaultProps: { elevation: 0 } },
                MuiCard: { defaultProps: { variant: 'outlined' } },
            },
        },
        esES,
        datePickersEs,
    );
}
