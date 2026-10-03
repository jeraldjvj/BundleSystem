import { z } from 'zod';

export const userIdSchema = z.object({
  user_id: z.coerce.number().int().positive(),
});

export const createUserSchema = z.object({
  mi_id: z.string().min(1).max(10),
  email: z.string().email().max(255),
  password_hash: z.string().min(1).max(255),
  status: z.string().max(50).default('active'),
  level_user: z.string().max(45).default('field force'),
});

export const updateUserSchema = createUserSchema.partial();
