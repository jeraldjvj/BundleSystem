import { Router } from 'express';
import { bundleModelController } from '../controllers/bundleModel.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  bundleModelIdSchema,
  createBundleModelSchema,
  updateBundleModelSchema,
} from '../schemas/bundleModel.schema.js';

const router = Router();

router.get('/', asyncHandler(bundleModelController.getAll));
router.get('/:bundle_model_id', validate(bundleModelIdSchema, 'params'), asyncHandler(bundleModelController.getById));
router.post('/', validate(createBundleModelSchema), asyncHandler(bundleModelController.create));
router.patch(
  '/:bundle_model_id',
  validate(bundleModelIdSchema, 'params'),
  validate(updateBundleModelSchema),
  asyncHandler(bundleModelController.update),
);
router.delete('/:bundle_model_id', validate(bundleModelIdSchema, 'params'), asyncHandler(bundleModelController.remove));

export default router;
