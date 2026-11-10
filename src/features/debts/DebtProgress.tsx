import { LinearProgress } from '@mui/material';

/** Share of the debt already paid, clamped to 0–100. */
export function DebtProgress({ paid, total }: { paid: number; total: number }) {
    const value = total > 0 ? Math.min(100, Math.max(0, (paid / total) * 100)) : 0;
    return (
        <LinearProgress
            variant="determinate"
            value={value}
            aria-label="Avance de pago"
            sx={{ height: 8, borderRadius: 4 }}
        />
    );
}
