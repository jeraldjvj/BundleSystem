import { Router } from 'express';
import { smartphoneController } from '../controllers/smartphone.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  smartphoneIdSchema,
  createSmartphoneSchema,
  updateSmartphoneSchema,
} from '../schemas/smartphone.schema.js';

const router = Router();

router.get('/', asyncHandler(smartphoneController.getAll));
router.get('/:smartphones_id', validate(smartphoneIdSchema, 'params'), asyncHandler(smartphoneController.getById));
router.post('/', validate(createSmartphoneSchema), asyncHandler(smartphoneController.create));
router.patch(
  '/:smartphones_id',
  validate(smartphoneIdSchema, 'params'),
  validate(updateSmartphoneSchema),
  asyncHandler(smartphoneController.update),
);
router.delete('/:smartphones_id', validate(smartphoneIdSchema, 'params'), asyncHandler(smartphoneController.remove));

export default router;
