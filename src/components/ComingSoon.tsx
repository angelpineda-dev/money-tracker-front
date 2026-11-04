import { ConstructionOutlined } from '@mui/icons-material';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { PageHeader } from './PageHeader';

/** Phase 1 placeholder; replaced by the real page in phase 2. */
export function ComingSoon({ title }: { title: string }) {
    return (
        <>
            <PageHeader title={title} />
            <Card>
                <CardContent>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <ConstructionOutlined color="action" />
                        <Typography color="text.secondary">Esta sección estará disponible pronto.</Typography>
                    </Stack>
                </CardContent>
            </Card>
        </>
    );
}
