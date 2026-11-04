import dayjs from 'dayjs';
import type { Currency } from '@/api/types';

const moneyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(value: number | null | undefined, currency: Currency): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    let fmt = moneyFormatters.get(currency);
    if (!fmt) {
        fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency });
        moneyFormatters.set(currency, fmt);
    }
    return fmt.format(value);
}

const percentFormatter = new Intl.NumberFormat('es-MX', { style: 'percent', maximumFractionDigits: 2 });

export function formatPercent(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '—';
    return percentFormatter.format(value);
}

export function formatDate(value: string | Date | null | undefined, pattern = 'D MMM YYYY'): string {
    return value ? dayjs(value).format(pattern) : '—';
}
