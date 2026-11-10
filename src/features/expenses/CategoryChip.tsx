import { Chip } from '@mui/material';

export function CategoryChip({ category }: { category: { name: string; color: string | null } }) {
    return (
        <Chip
            size="small"
            label={category.name}
            variant="outlined"
            sx={category.color ? { borderColor: category.color, color: 'text.primary' } : undefined}
        />
    );
}
