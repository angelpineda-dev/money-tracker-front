import { z } from 'zod';
import type { LoginBody, RegisterBody } from '@/api/types';

export const loginSchema = z.object({
    email: z.email('Correo inválido'),
    password: z.string().min(1, 'Ingresa tu contraseña'),
}) satisfies z.ZodType<LoginBody>;

/** Mirrors backend rules: 8+ chars, one uppercase, one digit. */
export const passwordSchema = z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe incluir una mayúscula')
    .regex(/\d/, 'Debe incluir un número');

export const registerSchema = z
    .object({
        email: z.email('Correo inválido'),
        name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
        password: passwordSchema,
        confirmed_password: z.string(),
    })
    .refine((d) => d.password === d.confirmed_password, {
        path: ['confirmed_password'],
        message: 'Las contraseñas no coinciden',
    }) satisfies z.ZodType<RegisterBody>;

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
