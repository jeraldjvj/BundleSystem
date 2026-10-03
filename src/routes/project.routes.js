import { Router } from 'express';
import { projectController } from '../controllers/project.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  projectIdSchema,
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schema.js';

const router = Router();

router.get('/', asyncHandler(projectController.getAll));
router.get('/:project_id', validate(projectIdSchema, 'params'), asyncHandler(projectController.getById));
router.post('/', validate(createProjectSchema), asyncHandler(projectController.create));
router.patch(
  '/:project_id',
  validate(projectIdSchema, 'params'),
  validate(updateProjectSchema),
  asyncHandler(projectController.update),
);
router.delete('/:project_id', validate(projectIdSchema, 'params'), asyncHandler(projectController.remove));

export default router;
