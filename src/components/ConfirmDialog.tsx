import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import type { ReactNode } from 'react';

export function ConfirmDialog({
    open,
    title,
    children,
    confirmLabel = 'Confirmar',
    destructive = false,
    loading = false,
    error,
    onConfirm,
    onClose,
}: {
    open: boolean;
    title: string;
    children: ReactNode;
    confirmLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    error?: string | null;
    onConfirm: () => void;
    onClose: () => void;
}) {
    return (
        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText component="div">{children}</DialogContentText>
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color={destructive ? 'error' : 'primary'}
                    loading={loading}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
