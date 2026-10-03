import { Router } from 'express';
import { bundleColorController } from '../controllers/bundleColor.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  bundleColorIdSchema,
  createBundleColorSchema,
  updateBundleColorSchema,
} from '../schemas/bundleColor.schema.js';

const router = Router();

router.get('/', asyncHandler(bundleColorController.getAll));
router.get('/:bundle_color_id', validate(bundleColorIdSchema, 'params'), asyncHandler(bundleColorController.getById));
router.post('/', validate(createBundleColorSchema), asyncHandler(bundleColorController.create));
router.patch(
  '/:bundle_color_id',
  validate(bundleColorIdSchema, 'params'),
  validate(updateBundleColorSchema),
  asyncHandler(bundleColorController.update),
);
router.delete('/:bundle_color_id', validate(bundleColorIdSchema, 'params'), asyncHandler(bundleColorController.remove));

export default router;
