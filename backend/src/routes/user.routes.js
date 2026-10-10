import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  userIdSchema,
  createUserSchema,
  updateUserSchema,
} from '../schemas/user.schema.js';

const router = Router();

router.get('/', asyncHandler(userController.getAll));
router.get('/:user_id', validate(userIdSchema, 'params'), asyncHandler(userController.getById));
router.post('/', validate(createUserSchema), asyncHandler(userController.create));
router.patch(
  '/:user_id',
  validate(userIdSchema, 'params'),
  validate(updateUserSchema),
  asyncHandler(userController.update),
);
router.delete('/:user_id', validate(userIdSchema, 'params'), asyncHandler(userController.remove));

export default router;
