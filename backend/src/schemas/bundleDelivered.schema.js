import { z } from 'zod';

export const bundleDeliveredIdSchema = z.object({
  bundle_delivered_id: z.coerce.number().int().positive(),
});

export const createBundleDeliveredSchema = z.object({
  user_id: z.coerce.number().int().positive(),
  bundle_id: z.coerce.number().int().positive(),
  smartphones_id: z.coerce.number().int().positive(),
  client_full_name: z.string().min(1).max(120),
  client_phone: z.string().min(1).max(45),
  client_picture: z.string().min(1).max(255),
  create_time: z.coerce.date().optional(),
  store_code: z.string().min(1).max(45),
  store_name: z.string().min(1).max(45),
});

export const updateBundleDeliveredSchema = createBundleDeliveredSchema.partial();
