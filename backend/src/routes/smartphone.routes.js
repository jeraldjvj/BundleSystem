import { Router } from 'express';
import { smartphoneController } from '../controllers/smartphone.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/requireRole.js';
import { lookupLimiter } from '../middlewares/rateLimiter.js';
import {
  smartphoneIdSchema,
  createSmartphoneSchema,
  updateSmartphoneSchema,
} from '../schemas/smartphone.schema.js';

const router = Router();

router.get('/', requireRole('Office Manager', 'City Manager'), asyncHandler(smartphoneController.getAll));
router.get('/imei/:imei', lookupLimiter, asyncHandler(smartphoneController.getByImei));
router.get('/:smartphones_id', validate(smartphoneIdSchema, 'params'), asyncHandler(smartphoneController.getById));
router.post('/', requireRole('Office Manager'), validate(createSmartphoneSchema), asyncHandler(smartphoneController.create));
router.patch(
  '/:smartphones_id',
  requireRole('Office Manager'),
  validate(smartphoneIdSchema, 'params'),
  validate(updateSmartphoneSchema),
  asyncHandler(smartphoneController.update),
);
router.delete('/:smartphones_id', requireRole('Office Manager'),  validate(smartphoneIdSchema, 'params'), asyncHandler(smartphoneController.remove));

export default router;
