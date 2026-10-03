import { z } from 'zod';

export const bundleIdSchema = z.object({
  id: z.string().uuid(),
});

export const createBundleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  price: z.number().nonnegative(),
  items: z.array(z.string().min(1)).default([]),
});

export const updateBundleSchema = createBundleSchema.partial();
