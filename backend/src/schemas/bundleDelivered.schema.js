import { z } from 'zod';

export const bundleDeliveredIdSchema = z.object({
  bundle_delivered_id: z.coerce.number().int().positive(),
});

// user_id lo fuerza el servidor desde el token; create_time siempre lo pone
// el servidor; store_name se toma de la BD — nunca se aceptan del cliente
export const createBundleDeliveredSchema = z.object({
  bundle_id: z.coerce.number().int().positive(),
  smartphones_id: z.coerce.number().int().positive(),
  client_full_name: z.string().min(1).max(120),
  client_phone: z.string().min(1).max(45),
  client_picture: z.string().min(1).max(255),
  store_code: z.string().min(1).max(45),
});

export const updateBundleDeliveredSchema = createBundleDeliveredSchema.partial();
