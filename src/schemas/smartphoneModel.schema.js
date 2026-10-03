import { z } from 'zod';

export const smartphoneModelIdSchema = z.object({
  smartphone_model_id: z.coerce.number().int().positive(),
});

export const createSmartphoneModelSchema = z.object({
  smartphone_color_id: z.coerce.number().int().positive(),
  model_code: z.string().min(1).max(45),
  model_name: z.string().min(1).max(50),
  ram: z.string().min(1).max(5),
  rom: z.string().min(1).max(5),
});

export const updateSmartphoneModelSchema = createSmartphoneModelSchema.partial();
