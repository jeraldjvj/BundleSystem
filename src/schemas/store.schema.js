import { z } from 'zod';

export const storeCodeSchema = z.object({
  store_code: z.string().min(1).max(45),
});

export const createStoreSchema = z.object({
  store_code: z.string().min(1).max(45),
  user_id: z.coerce.number().int().positive(),
  rms_store_code: z.string().min(1).max(45),
  store_name: z.string().min(1).max(45),
});

export const updateStoreSchema = createStoreSchema.partial();
