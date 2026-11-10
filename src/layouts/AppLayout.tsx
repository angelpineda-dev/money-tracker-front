import {
    AdminPanelSettingsOutlined,
    CategoryOutlined,
    CreditCardOutlined,
    DashboardOutlined,
    EventRepeatOutlined,
    Logout,
    Menu as MenuIcon,
    PaymentsOutlined,
    ReceiptLongOutlined,
    SavingsOutlined,
    SettingsOutlined,
    ShowChart,
    WorkOutlineOutlined,
} from '@mui/icons-material';
import {
    AppBar,
    Avatar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    ToggleButton,
    ToggleButtonGroup,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { type ReactNode, Suspense, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { ADMIN_ROLES, type Role } from '@/api/types';
import { SplashScreen } from '@/components/SplashScreen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLogout } from '@/hooks/useSession';
import { PATHS, SECTION, SECTION_HOME, type Section, sectionOf } from '@/routes/paths';
import { useAuthStore } from '@/stores/authStore';

const DRAWER_WIDTH = 240;

interface NavItem {
    to: string;
    label: string;
    icon: ReactNode;
    roles?: readonly Role[];
}

/** Section-specific entries; one list per section so adding a section forces its nav (Record is exhaustive). */
const SECTION_NAV: Record<Section, NavItem[]> = {
    [SECTION.INVESTMENTS]: [
        { to: PATHS.investments.dashboard, label: 'Resumen', icon: <DashboardOutlined /> },
        { to: PATHS.investments.assets, label: 'Activos', icon: <WorkOutlineOutlined /> },
        { to: PATHS.investments.transactions, label: 'Operaciones', icon: <ReceiptLongOutlined /> },
    ],
    [SECTION.EXPENSES]: [
        { to: PATHS.expenses.summary, label: 'Resumen', icon: <DashboardOutlined /> },
        { to: PATHS.expenses.list, label: 'Movimientos', icon: <PaymentsOutlined /> },
        { to: PATHS.expenses.income, label: 'Ingresos', icon: <SavingsOutlined /> },
        { to: PATHS.expenses.recurring, label: 'Recurrentes', icon: <EventRepeatOutlined /> },
        { to: PATHS.expenses.debts, label: 'Deudas', icon: <CreditCardOutlined /> },
        { to: PATHS.expenses.categories, label: 'Categorías', icon: <CategoryOutlined /> },
    ],
};

const SECTION_LABEL: Record<Section, string> = {
    [SECTION.INVESTMENTS]: 'Inversiones',
    [SECTION.EXPENSES]: 'Gastos',
};

/** Entries shown in every section. */
const GLOBAL_NAV: NavItem[] = [
    { to: PATHS.settings, label: 'Configuración', icon: <SettingsOutlined /> },
    { to: PATHS.admin, label: 'Administración', icon: <AdminPanelSettingsOutlined />, roles: ADMIN_ROLES },
];

export function AppLayout() {
    const theme = useTheme();
    const desktop = useMediaQuery(theme.breakpoints.up('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const section = sectionOf(useLocation().pathname);
    const visible = (item: NavItem) => !item.roles || (user && item.roles.includes(user.role));

    const renderItems = (items: NavItem[]) =>
        items.filter(visible).map((item) => (
            <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    '&.active': { bgcolor: 'action.selected', color: 'primary.main' },
                    '&.active .MuiListItemIcon-root': { color: 'primary.main' },
                }}
            >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
            </ListItemButton>
        ));

    const nav = (
        <>
            <Toolbar />
            <Box sx={{ px: 1.5, pt: 1.5 }}>
                <ToggleButtonGroup
                    fullWidth
                    size="small"
                    exclusive
                    color="primary"
                    value={section}
                    onChange={(_, next: Section | null) => next && navigate(SECTION_HOME[next])}
                    aria-label="Sección"
                >
                    {Object.values(SECTION).map((s) => (
                        <ToggleButton key={s} value={s}>
                            {SECTION_LABEL[s]}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Box>
            <List sx={{ px: 1 }}>{renderItems(SECTION_NAV[section])}</List>
            <Divider sx={{ mx: 1 }} />
            <List sx={{ px: 1 }}>{renderItems(GLOBAL_NAV)}</List>
        </>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{ zIndex: (t) => t.zIndex.drawer + 1, borderBottom: 1, borderColor: 'divider' }}
            >
                <Toolbar>
                    {!desktop && (
                        <IconButton
                            edge="start"
                            aria-label="Abrir menú"
                            onClick={() => setMobileOpen(true)}
                            sx={{ mr: 1 }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}
                    <ShowChart color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" component="span" sx={{ flexGrow: 1, fontWeight: 700 }}>
                        Money Tracker
                    </Typography>
                    <ThemeToggle />
                    <UserMenu />
                </Toolbar>
            </AppBar>

            <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
                <Drawer
                    variant={desktop ? 'permanent' : 'temporary'}
                    open={desktop || mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
                >
                    {nav}
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, sm: 3 } }}>
                <Toolbar />
                <Suspense fallback={<SplashScreen />}>
                    <Outlet />
                </Suspense>
            </Box>
        </Box>
    );
}

function UserMenu() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const logout = useLogout();
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);
    if (!user) return null;
    const initial = user.name.trim().charAt(0).toUpperCase() || '?';

    return (
        <>
            <Tooltip title="Cuenta">
                <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Menú de usuario" sx={{ ml: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 15 }}>{initial}</Avatar>
                </IconButton>
            </Tooltip>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user.email}
                    </Typography>
                </Box>
                <Divider />
                <MenuItem
                    onClick={() => {
                        setAnchor(null);
                        navigate(PATHS.settings);
                    }}
                >
                    <ListItemIcon>
                        <SettingsOutlined fontSize="small" />
                    </ListItemIcon>
                    Configuración
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        setAnchor(null);
                        void logout();
                    }}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Cerrar sesión
                </MenuItem>
            </Menu>
        </>
    );
}
