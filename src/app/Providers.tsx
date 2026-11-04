import { CssBaseline, ThemeProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { type ReactNode, useMemo } from 'react';
import '@/lib/dayjs';
import { useUiStore } from '@/stores/uiStore';
import { queryClient } from './queryClient';
import { buildTheme } from './theme';

export function Providers({ children }: { children: ReactNode }) {
    const mode = useUiStore((s) => s.themeMode);
    const theme = useMemo(() => buildTheme(mode), [mode]);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                    <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                        {children}
                    </SnackbarProvider>
                </LocalizationProvider>
            </ThemeProvider>
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
}
