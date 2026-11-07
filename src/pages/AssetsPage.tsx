import { Add, EditOutlined } from '@mui/icons-material';
import {
    Button,
    Card,
    CardContent,
    Chip,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import type { Asset } from '@/api/types';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { AssetDialog } from '@/features/assets/AssetDialog';
import { useAssets } from '@/features/portfolio/queries';
import { formatMoney } from '@/lib/format';

export default function AssetsPage() {
    const assets = useAssets();
    const [dialog, setDialog] = useState<{ open: boolean; asset: Asset | null }>({ open: false, asset: null });

    return (
        <>
            <PageHeader
                title="Activos"
                subtitle="Acciones y fondos que sigues"
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setDialog({ open: true, asset: null })}
                    >
                        Nuevo activo
                    </Button>
                }
            />
            <QueryState isPending={assets.isPending} error={assets.error} onRetry={() => assets.refetch()} />
            {assets.data?.length === 0 && (
                <Card>
                    <CardContent>
                        <Typography color="text.secondary">Agrega tu primer activo para empezar.</Typography>
                    </CardContent>
                </Card>
            )}
            {Boolean(assets.data?.length) && (
                <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Símbolo</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell align="right">Precio</TableCell>
                                <TableCell>Moneda</TableCell>
                                <TableCell align="right" />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {assets.data?.map((a) => (
                                <TableRow key={a.id} hover>
                                    <TableCell>
                                        <Link component={RouterLink} to={`/assets/${a.id}`} sx={{ fontWeight: 600 }}>
                                            {a.symbol}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{a.name}</TableCell>
                                    <TableCell align="right">{formatMoney(a.currentPrice, a.currency)}</TableCell>
                                    <TableCell>
                                        <Chip label={a.currency} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Editar">
                                            <IconButton
                                                aria-label={`Editar ${a.symbol}`}
                                                onClick={() => setDialog({ open: true, asset: a })}
                                            >
                                                <EditOutlined />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <AssetDialog
                open={dialog.open}
                asset={dialog.asset}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
        </>
    );
}
