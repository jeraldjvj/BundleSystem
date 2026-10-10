import { Router } from 'express';
import { userProfileController } from '../controllers/userProfile.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  profileIdSchema,
  createUserProfileSchema,
  updateUserProfileSchema,
} from '../schemas/userProfile.schema.js';

const router = Router();

router.get('/', asyncHandler(userProfileController.getAll));
router.get('/:profile_id', validate(profileIdSchema, 'params'), asyncHandler(userProfileController.getById));
router.post('/', validate(createUserProfileSchema), asyncHandler(userProfileController.create));
router.patch(
  '/:profile_id',
  validate(profileIdSchema, 'params'),
  validate(updateUserProfileSchema),
  asyncHandler(userProfileController.update),
);
router.delete('/:profile_id', validate(profileIdSchema, 'params'), asyncHandler(userProfileController.remove));

export default router;
