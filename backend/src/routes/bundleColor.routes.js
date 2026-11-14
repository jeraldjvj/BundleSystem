import { Router } from 'express';
import { bundleColorController } from '../controllers/bundleColor.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  bundleColorIdSchema,
  createBundleColorSchema,
  updateBundleColorSchema,
} from '../schemas/bundleColor.schema.js';

const router = Router();

router.get('/', asyncHandler(bundleColorController.getAll));
router.get('/:bundle_color_id', validate(bundleColorIdSchema, 'params'), asyncHandler(bundleColorController.getById));
router.post('/', requireRole('Office Manager'), validate(createBundleColorSchema), asyncHandler(bundleColorController.create));
router.patch(
  '/:bundle_color_id',
  requireRole('Office Manager'),
  validate(bundleColorIdSchema, 'params'),
  validate(updateBundleColorSchema),
  asyncHandler(bundleColorController.update),
);
router.delete('/:bundle_color_id', requireRole('Office Manager'),  validate(bundleColorIdSchema, 'params'), asyncHandler(bundleColorController.remove));

export default router;
