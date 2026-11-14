import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/requireRole.js';
import { lookupLimiter } from '../middlewares/rateLimiter.js';
import {
  userIdSchema,
  createUserSchema,
  updateUserSchema,
} from '../schemas/user.schema.js';

const router = Router();

router.get('/', requireRole('Office Manager', 'City Manager'), asyncHandler(userController.getAll));
router.get('/by-mi-id/:mi_id', lookupLimiter, asyncHandler(userController.getByMiId));
router.get('/:user_id', validate(userIdSchema, 'params'), asyncHandler(userController.getById));
router.post('/', requireRole('Office Manager'), validate(createUserSchema), asyncHandler(userController.create));
router.patch(
  '/:user_id',
  requireRole('Office Manager'),
  validate(userIdSchema, 'params'),
  validate(updateUserSchema),
  asyncHandler(userController.update),
);
router.delete('/:user_id', requireRole('Office Manager'), validate(userIdSchema, 'params'), asyncHandler(userController.remove));

export default router;
