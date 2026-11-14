import { Router } from 'express';
import { storeController } from '../controllers/store.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/requireRole.js';
import {
  storeCodeSchema,
  createStoreSchema,
  updateStoreSchema,
} from '../schemas/store.schema.js';

const router = Router();

router.get('/mine', asyncHandler(storeController.getByUserId));
router.get('/', requireRole('Office Manager'), asyncHandler(storeController.getAll));
router.get('/:store_code', requireRole('Office Manager'), validate(storeCodeSchema, 'params'), asyncHandler(storeController.getById));
router.post('/', requireRole('Office Manager'), validate(createStoreSchema), asyncHandler(storeController.create));
router.patch(
  '/:store_code',
  requireRole('Office Manager'),
  validate(storeCodeSchema, 'params'),
  validate(updateStoreSchema),
  asyncHandler(storeController.update),
);
router.delete('/:store_code', requireRole('Office Manager'), validate(storeCodeSchema, 'params'), asyncHandler(storeController.remove));

export default router;
