import { z } from 'zod';

export const profileIdSchema = z.object({
  profile_id: z.coerce.number().int().positive(),
});

export const createUserProfileSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  first_name: z.string().min(1).max(50),
  last_name: z.string().min(1).max(60),
  role_title: z.string().min(1).max(45),
  date_of_birth: z.coerce.date(),
  profile_picture: z.string().max(255).optional(),
});

export const updateUserProfileSchema = createUserProfileSchema.partial();
