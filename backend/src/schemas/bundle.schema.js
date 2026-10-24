import { z } from 'zod';

export const bundleIdSchema = z.object({
  bundle_id: z.coerce.number().int().positive(),
});

export const createBundleSchema = z.object({
  project_id: z.coerce.number().int().positive(),
  user_id: z.coerce.number().int().positive(),
  serial_number: z.string().min(1).max(50),
  bundle_model_id: z.coerce.number().int().positive(),
  create_time: z.coerce.date().optional(),
});

export const updateBundleSchema = createBundleSchema.partial();

export const assignBundleSchema = z.object({
  new_user_id: z.coerce.number().int().positive(),
});
