import { z } from 'zod';

export const distributorIdSchema = z.object({
  distributor_id: z.coerce.number().int().positive(),
});

export const createDistributorSchema = z.object({
  distributor_name: z.string().min(1).max(60),
});

export const updateDistributorSchema = createDistributorSchema.partial();
