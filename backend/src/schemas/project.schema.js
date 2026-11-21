import { z } from 'zod';

export const projectIdSchema = z.object({
  project_id: z.coerce.number().int().positive(),
});

export const createProjectSchema = z.object({
  project_name: z.string().min(1).max(60),
  start_date: z.coerce.date(),
  status: z.string().max(50).optional(),
  limiter_per_client: z.coerce.number().int().min(0).default(0),
});

export const updateProjectSchema = createProjectSchema.partial();
