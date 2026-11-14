import { Router } from 'express';
import { bundleDeliveredController } from '../controllers/bundleDelivered.controller.js';
import { uploadPicture } from '../middlewares/uploadPicture.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { requireRole } from '../middlewares/requireRole.js';
import { uploadLimiter } from '../middlewares/rateLimiter.js';
import {
  bundleDeliveredIdSchema,
  createBundleDeliveredSchema,
  updateBundleDeliveredSchema,
} from '../schemas/bundleDelivered.schema.js';

const router = Router();

router.get('/', requireRole('Office Manager', 'City Manager'), asyncHandler(bundleDeliveredController.getAll));
router.post(
  '/upload-picture',
  uploadLimiter,
  uploadPicture.single('picture'),
  (req, res) => {
    if (!req.file) throw new HttpError(422, 'No se recibió ninguna imagen');
    res.status(201).json({ client_picture: `uploads/${req.file.filename}` });
  },
);
router.get('/:bundle_delivered_id', requireRole('Office Manager', 'City Manager'), validate(bundleDeliveredIdSchema, 'params'), asyncHandler(bundleDeliveredController.getById));
router.post('/', validate(createBundleDeliveredSchema), asyncHandler(bundleDeliveredController.create));
router.patch(
  '/:bundle_delivered_id',
  requireRole('Office Manager'),
  validate(bundleDeliveredIdSchema, 'params'),
  validate(updateBundleDeliveredSchema),
  asyncHandler(bundleDeliveredController.update),
);
router.delete('/:bundle_delivered_id', requireRole('Office Manager'), validate(bundleDeliveredIdSchema, 'params'), asyncHandler(bundleDeliveredController.remove));

export default router;
