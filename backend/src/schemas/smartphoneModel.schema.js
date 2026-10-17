import { z } from 'zod';

export const smartphoneModelIdSchema = z.object({
  smartphone_model_id: z.coerce.number().int().positive(),
});

export const createSmartphoneModelSchema = z.object({
  product_id: z.string().min(1).max(45),
  model_name: z.string().min(1).max(50),
  sku_name: z.string().min(1).max(200),
  ram: z.string().min(1).max(5),
  rom: z.string().min(1).max(5),
  color_eng: z.string().min(1).max(45),
});

export const updateSmartphoneModelSchema = createSmartphoneModelSchema.partial();
