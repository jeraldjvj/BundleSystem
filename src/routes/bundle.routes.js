import { Router } from 'express';
import { bundleController } from '../controllers/bundle.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  bundleIdSchema,
  createBundleSchema,
  updateBundleSchema,
} from '../schemas/bundle.schema.js';

const router = Router();

router.get('/', asyncHandler(bundleController.getAll));
router.get('/:id', validate(bundleIdSchema, 'params'), asyncHandler(bundleController.getById));
router.post('/', validate(createBundleSchema), asyncHandler(bundleController.create));
router.patch(
  '/:id',
  validate(bundleIdSchema, 'params'),
  validate(updateBundleSchema),
  asyncHandler(bundleController.update),
);
router.delete('/:id', validate(bundleIdSchema, 'params'), asyncHandler(bundleController.remove));

export default router;
