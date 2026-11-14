import { Router } from 'express';
import { distributorController } from '../controllers/distributor.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  distributorIdSchema,
  createDistributorSchema,
  updateDistributorSchema,
} from '../schemas/distributor.schema.js';

const router = Router();

router.get('/', asyncHandler(distributorController.getAll));
router.get('/:distributor_id', validate(distributorIdSchema, 'params'), asyncHandler(distributorController.getById));
router.post('/', requireRole('Office Manager'), validate(createDistributorSchema), asyncHandler(distributorController.create));
router.patch(
  '/:distributor_id',
  requireRole('Office Manager'),
  validate(distributorIdSchema, 'params'),
  validate(updateDistributorSchema),
  asyncHandler(distributorController.update),
);
router.delete('/:distributor_id', requireRole('Office Manager'),  validate(distributorIdSchema, 'params'), asyncHandler(distributorController.remove));

export default router;
