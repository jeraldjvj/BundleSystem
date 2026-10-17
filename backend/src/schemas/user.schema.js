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
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(60),
  role_title: z.string().min(1).max(45),
  date_of_birth: z.coerce.date(),
  city: z.string().min(1).max(45),
  head_in_charge: z.string().min(1).max(200),
  profile_picture: z.string().max(255).optional(),
});

export const updateUserSchema = createUserSchema.partial();
