import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useUiStore } from '@/stores/uiStore';

export function ThemeToggle() {
    const mode = useUiStore((s) => s.themeMode);
    const toggle = useUiStore((s) => s.toggleTheme);
    const label = mode === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro';
    return (
        <Tooltip title={label}>
            <IconButton onClick={toggle} aria-label={label} color="inherit">
                {mode === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
            </IconButton>
        </Tooltip>
    );
}
