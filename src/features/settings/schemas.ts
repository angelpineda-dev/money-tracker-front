import { z } from 'zod';
import type { ChangePasswordBody, UpdateProfileBody } from '@/api/types';
import { passwordSchema } from '@/features/auth/schemas';

export const profileSchema = z.object({
    name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
}) satisfies z.ZodType<UpdateProfileBody, unknown>;

export const changePasswordSchema = z
    .object({
        current_password: z.string().min(1, 'Ingresa tu contraseña actual'),
        new_password: passwordSchema,
        confirmed_password: z.string(),
        close_sessions: z.boolean(),
    })
    .refine((d) => d.new_password === d.confirmed_password, {
        path: ['confirmed_password'],
        message: 'Las contraseñas no coinciden',
    }) satisfies z.ZodType<ChangePasswordBody, unknown>;

export type ProfileValues = z.infer<typeof profileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
