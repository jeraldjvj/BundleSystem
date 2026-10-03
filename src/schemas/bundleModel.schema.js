import { z } from 'zod';

export const bundleModelIdSchema = z.object({
  bundle_model_id: z.coerce.number().int().positive(),
});

export const createBundleModelSchema = z.object({
  bundle_name: z.string().min(1).max(45),
  bundle_color_id: z.coerce.number().int().positive(),
});

export const updateBundleModelSchema = createBundleModelSchema.partial();
