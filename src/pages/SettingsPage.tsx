import { Box } from '@mui/material';
import { PageHeader } from '@/components/PageHeader';
import { DangerZoneCard } from '@/features/settings/DangerZoneCard';
import { PasswordCard } from '@/features/settings/PasswordCard';
import { ProfileCard } from '@/features/settings/ProfileCard';
import { TelegramCard } from '@/features/settings/TelegramCard';

export default function SettingsPage() {
    return (
        <>
            <PageHeader title="Configuración" />
            <Box
                sx={{
                    display: 'grid',
                    gap: 3,
                    gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
                    alignItems: 'start',
                }}
            >
                <ProfileCard />
                <PasswordCard />
                <TelegramCard />
                <DangerZoneCard />
            </Box>
        </>
    );
}
