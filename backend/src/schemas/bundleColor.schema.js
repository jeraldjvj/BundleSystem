import { z } from 'zod';

export const bundleColorIdSchema = z.object({
  bundle_color_id: z.coerce.number().int().positive(),
});

export const createBundleColorSchema = z.object({
  color_name_eng: z.string().min(1).max(45),
  color_name_spa: z.string().min(1).max(45),
});

export const updateBundleColorSchema = createBundleColorSchema.partial();
