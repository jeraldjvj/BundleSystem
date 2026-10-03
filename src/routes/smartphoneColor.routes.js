import { Router } from 'express';
import { smartphoneColorController } from '../controllers/smartphoneColor.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  smartphoneColorIdSchema,
  createSmartphoneColorSchema,
  updateSmartphoneColorSchema,
} from '../schemas/smartphoneColor.schema.js';

const router = Router();

router.get('/', asyncHandler(smartphoneColorController.getAll));
router.get('/:smartphone_color_id', validate(smartphoneColorIdSchema, 'params'), asyncHandler(smartphoneColorController.getById));
router.post('/', validate(createSmartphoneColorSchema), asyncHandler(smartphoneColorController.create));
router.patch(
  '/:smartphone_color_id',
  validate(smartphoneColorIdSchema, 'params'),
  validate(updateSmartphoneColorSchema),
  asyncHandler(smartphoneColorController.update),
);
router.delete('/:smartphone_color_id', validate(smartphoneColorIdSchema, 'params'), asyncHandler(smartphoneColorController.remove));

export default router;
