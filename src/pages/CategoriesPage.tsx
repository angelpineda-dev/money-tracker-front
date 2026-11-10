import { Add, DeleteOutlined, EditOutlined } from '@mui/icons-material';
import { Button, IconButton, List, ListItem, ListItemText, Paper, Tooltip, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { errorMessage } from '@/api/errors';
import type { ExpenseCategory } from '@/api/types';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { PageHeader } from '@/components/PageHeader';
import { QueryState } from '@/components/QueryState';
import { CategoryDialog } from '@/features/categories/CategoryDialog';
import { CategoryChip } from '@/features/expenses/CategoryChip';
import { useDeleteCategory, useExpenseCategories } from '@/features/expenses/queries';

export default function CategoriesPage() {
    const categories = useExpenseCategories();
    const remove = useDeleteCategory();
    const { enqueueSnackbar } = useSnackbar();
    const [dialog, setDialog] = useState<{ open: boolean; category: ExpenseCategory | null }>({
        open: false,
        category: null,
    });
    const [toDelete, setToDelete] = useState<ExpenseCategory | null>(null);

    return (
        <>
            <PageHeader
                title="Categorías"
                subtitle="Clasifica tus gastos como quieras"
                action={
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setDialog({ open: true, category: null })}
                    >
                        Nueva categoría
                    </Button>
                }
            />
            <QueryState
                isPending={categories.isPending}
                error={categories.error}
                onRetry={() => categories.refetch()}
            />
            {categories.data?.length === 0 && (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    No tienes categorías. Crea una para registrar gastos.
                </Typography>
            )}
            {categories.data && categories.data.length > 0 && (
                <Paper variant="outlined" sx={{ maxWidth: 560 }}>
                    <List disablePadding>
                        {categories.data.map((c) => (
                            <ListItem
                                key={c.id}
                                divider
                                secondaryAction={
                                    <>
                                        <Tooltip title="Editar">
                                            <IconButton
                                                size="small"
                                                aria-label={`Editar ${c.name}`}
                                                onClick={() => setDialog({ open: true, category: c })}
                                            >
                                                <EditOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Eliminar">
                                            <IconButton
                                                size="small"
                                                aria-label={`Eliminar ${c.name}`}
                                                onClick={() => {
                                                    remove.reset();
                                                    setToDelete(c);
                                                }}
                                            >
                                                <DeleteOutlined fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                }
                            >
                                <ListItemText disableTypography primary={<CategoryChip category={c} />} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
            <CategoryDialog
                open={dialog.open}
                category={dialog.category}
                onClose={() => setDialog((d) => ({ ...d, open: false }))}
            />
            <ConfirmDialog
                open={Boolean(toDelete)}
                title="Eliminar categoría"
                confirmLabel="Eliminar"
                destructive
                loading={remove.isPending}
                error={remove.isError ? errorMessage(remove.error) : null}
                onClose={() => setToDelete(null)}
                onConfirm={() =>
                    toDelete &&
                    remove.mutate(toDelete.id, {
                        onSuccess: () => {
                            enqueueSnackbar('Categoría eliminada', { variant: 'success' });
                            setToDelete(null);
                        },
                    })
                }
            >
                {toDelete && `¿Eliminar la categoría "${toDelete.name}"?`}
            </ConfirmDialog>
        </>
    );
}
