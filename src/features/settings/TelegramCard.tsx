import { ContentCopy, Telegram } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { errorMessage } from '@/api/errors';
import { userApi } from '@/api/user';
import { ConfirmDialog } from '@/components/ConfirmDialog';

function useSecondsLeft(expiresAt: string | undefined): number {
    const calc = () => (expiresAt ? Math.max(0, dayjs(expiresAt).diff(dayjs(), 'second')) : 0);
    const [left, setLeft] = useState(calc);
    // biome-ignore lint/correctness/useExhaustiveDependencies: calc only depends on expiresAt
    useEffect(() => {
        setLeft(calc());
        if (!expiresAt) return;
        const id = window.setInterval(() => setLeft(calc()), 1000);
        return () => window.clearInterval(id);
    }, [expiresAt]);
    return left;
}

export function TelegramCard() {
    const { enqueueSnackbar } = useSnackbar();
    const generate = useMutation({ mutationFn: userApi.telegramLinkCode });
    const unlink = useMutation({
        mutationFn: userApi.unlinkTelegram,
        onSuccess: () => {
            setConfirmUnlink(false);
            enqueueSnackbar('Telegram desvinculado', { variant: 'success' });
        },
    });
    const [confirmUnlink, setConfirmUnlink] = useState(false);
    const left = useSecondsLeft(generate.data?.expiresAt);
    const command = generate.data ? `/link ${generate.data.code}` : '';
    const active = Boolean(generate.data) && left > 0;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(command);
            enqueueSnackbar('Comando copiado', { variant: 'info' });
        } catch {
            enqueueSnackbar('No se pudo copiar', { variant: 'error' });
        }
    };

    return (
        <Card>
            <CardContent>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
                    <Telegram color="primary" />
                    <Typography variant="h6" component="h2">
                        Telegram
                    </Typography>
                </Stack>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Vincula tu chat para consultar tu portafolio desde el bot. Genera un código y envíaselo al bot con
                    el comando <code>/link CÓDIGO</code>. El código vence en 10 minutos.
                </Typography>
                {generate.isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMessage(generate.error)}
                    </Alert>
                )}
                {generate.data && (
                    <Box
                        sx={{
                            mb: 2,
                            p: 2,
                            borderRadius: 2,
                            border: 1,
                            borderColor: active ? 'primary.main' : 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <Box>
                            <Typography
                                sx={{
                                    fontFamily: 'monospace',
                                    fontSize: 22,
                                    letterSpacing: 2,
                                    opacity: active ? 1 : 0.4,
                                }}
                            >
                                {command}
                            </Typography>
                            <Typography variant="body2" color={active ? 'text.secondary' : 'error.main'} role="timer">
                                {active
                                    ? `Vence en ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
                                    : 'Código expirado. Genera uno nuevo.'}
                            </Typography>
                        </Box>
                        <Tooltip title="Copiar comando">
                            <span>
                                <IconButton onClick={copy} disabled={!active} aria-label="Copiar comando">
                                    <ContentCopy />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                )}
                <Stack direction="row" spacing={1.5}>
                    <Button variant="contained" onClick={() => generate.mutate()} loading={generate.isPending}>
                        {generate.data ? 'Generar nuevo código' : 'Generar código'}
                    </Button>
                    <Button
                        color="error"
                        onClick={() => {
                            unlink.reset();
                            setConfirmUnlink(true);
                        }}
                    >
                        Desvincular
                    </Button>
                </Stack>
            </CardContent>
            <ConfirmDialog
                open={confirmUnlink}
                title="Desvincular Telegram"
                confirmLabel="Desvincular"
                destructive
                loading={unlink.isPending}
                error={unlink.isError ? errorMessage(unlink.error) : null}
                onClose={() => setConfirmUnlink(false)}
                onConfirm={() => unlink.mutate()}
            >
                El bot dejará de responder a tu chat hasta que lo vuelvas a vincular.
            </ConfirmDialog>
        </Card>
    );
}
