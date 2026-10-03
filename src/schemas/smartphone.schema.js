import { z } from 'zod';

export const smartphoneIdSchema = z.object({
  smartphones_id: z.coerce.number().int().positive(),
});

export const createSmartphoneSchema = z.object({
  smartphones_id: z.coerce.number().int().positive(),
  smartphone_model_id: z.coerce.number().int().positive(),
  tag_model: z.string().min(1).max(45),
  imei_1: z.string().min(1).max(45),
  distributor: z.string().min(1).max(45),
  status: z.string().max(45).default('available'),
});

export const updateSmartphoneSchema = createSmartphoneSchema.partial();
