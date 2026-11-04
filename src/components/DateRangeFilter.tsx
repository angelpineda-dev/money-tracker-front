import { Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs, { type Dayjs } from 'dayjs';
import type { DateRange } from '@/api/queryKeys';

const ISO = 'YYYY-MM-DD';

const PRESETS = {
    all: { label: 'Todo', range: (): DateRange => ({}) },
    ytd: { label: 'Este año', range: (): DateRange => ({ from: dayjs().startOf('year').format(ISO) }) },
    '12m': { label: '12 meses', range: (): DateRange => ({ from: dayjs().subtract(12, 'month').format(ISO) }) },
    '3m': { label: '3 meses', range: (): DateRange => ({ from: dayjs().subtract(3, 'month').format(ISO) }) },
} as const;

type Preset = keyof typeof PRESETS;

function matchingPreset(value: DateRange): Preset | null {
    for (const [key, preset] of Object.entries(PRESETS) as [Preset, (typeof PRESETS)[Preset]][]) {
        const r = preset.range();
        if (r.from === value.from && r.to === value.to) return key;
    }
    return null;
}

const toDay = (v?: string) => (v ? dayjs(v) : null);
const fromDay = (v: Dayjs | null) => (v?.isValid() ? v.format(ISO) : undefined);

export function DateRangeFilter({
    value,
    onChange,
    presets = true,
}: {
    value: DateRange;
    onChange: (range: DateRange) => void;
    presets?: boolean;
}) {
    const from = toDay(value.from);
    const to = toDay(value.to);

    return (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
            {presets && (
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={matchingPreset(value)}
                    onChange={(_, key: Preset | null) => key && onChange(PRESETS[key].range())}
                    aria-label="Rango rápido"
                >
                    {(Object.keys(PRESETS) as Preset[]).map((key) => (
                        <ToggleButton key={key} value={key} sx={{ px: 1.5 }}>
                            {PRESETS[key].label}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            )}
            <Stack direction="row" spacing={1.5}>
                <DatePicker
                    label="Desde"
                    value={from}
                    maxDate={to ?? undefined}
                    onChange={(v) => onChange({ ...value, from: fromDay(v) })}
                    slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
                    disableFuture
                />
                <DatePicker
                    label="Hasta"
                    value={to}
                    minDate={from ?? undefined}
                    onChange={(v) => onChange({ ...value, to: fromDay(v) })}
                    slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
                    disableFuture
                />
            </Stack>
        </Stack>
    );
}
