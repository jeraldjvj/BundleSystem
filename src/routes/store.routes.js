import { Router } from 'express';
import { storeController } from '../controllers/store.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  storeCodeSchema,
  createStoreSchema,
  updateStoreSchema,
} from '../schemas/store.schema.js';

const router = Router();

router.get('/', asyncHandler(storeController.getAll));
router.get('/:store_code', validate(storeCodeSchema, 'params'), asyncHandler(storeController.getById));
router.post('/', validate(createStoreSchema), asyncHandler(storeController.create));
router.patch(
  '/:store_code',
  validate(storeCodeSchema, 'params'),
  validate(updateStoreSchema),
  asyncHandler(storeController.update),
);
router.delete('/:store_code', validate(storeCodeSchema, 'params'), asyncHandler(storeController.remove));

export default router;
