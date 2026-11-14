import { Router } from 'express';
import { smartphoneModelController } from '../controllers/smartphoneModel.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  smartphoneModelIdSchema,
  createSmartphoneModelSchema,
  updateSmartphoneModelSchema,
} from '../schemas/smartphoneModel.schema.js';

const router = Router();

router.get('/', asyncHandler(smartphoneModelController.getAll));
router.get('/:smartphone_model_id', validate(smartphoneModelIdSchema, 'params'), asyncHandler(smartphoneModelController.getById));
router.post('/', requireRole('Office Manager'), validate(createSmartphoneModelSchema), asyncHandler(smartphoneModelController.create));
router.patch(
  '/:smartphone_model_id',
  requireRole('Office Manager'),
  validate(smartphoneModelIdSchema, 'params'),
  validate(updateSmartphoneModelSchema),
  asyncHandler(smartphoneModelController.update),
);
router.delete('/:smartphone_model_id', requireRole('Office Manager'),  validate(smartphoneModelIdSchema, 'params'), asyncHandler(smartphoneModelController.remove));

export default router;
