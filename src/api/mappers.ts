/**
 * Prisma Decimal columns are serialized as strings. Every numeric field coming from the API
 * passes through here so the rest of the app only ever sees numbers.
 */
export function toNumber(value: unknown): number {
    return typeof value === 'number' ? value : Number(value);
}

export function toNullableNumber(value: unknown): number | null {
    return value === null || value === undefined ? null : toNumber(value);
}

export function mapNumbers<T extends object>(
    row: T,
    keys: readonly (keyof T)[],
    nullable: readonly (keyof T)[] = [],
): T {
    const out = { ...row } as Record<keyof T, unknown>;
    for (const key of keys) out[key] = toNumber(row[key]);
    for (const key of nullable) out[key] = toNullableNumber(row[key]);
    return out as T;
}
