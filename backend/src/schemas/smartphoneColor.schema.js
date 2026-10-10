import { z } from 'zod';

export const smartphoneColorIdSchema = z.object({
  smartphone_color_id: z.coerce.number().int().positive(),
});

export const createSmartphoneColorSchema = z.object({
  color_name_eng: z.string().min(1).max(45),
  color_name_spa: z.string().min(1).max(45),
});

export const updateSmartphoneColorSchema = createSmartphoneColorSchema.partial();
