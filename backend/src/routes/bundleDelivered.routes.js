import { Router } from 'express';
import { bundleDeliveredController } from '../controllers/bundleDelivered.controller.js';
import { uploadPicture } from '../middlewares/uploadPicture.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import {
  bundleDeliveredIdSchema,
  createBundleDeliveredSchema,
  updateBundleDeliveredSchema,
} from '../schemas/bundleDelivered.schema.js';

const router = Router();

router.get('/', asyncHandler(bundleDeliveredController.getAll));
router.post(
  '/upload-picture',
  uploadPicture.single('picture'),
  (req, res) => {
    if (!req.file) throw new HttpError(422, 'No se recibió ninguna imagen');
    res.status(201).json({ client_picture: `uploads/${req.file.filename}` });
  },
);
router.get('/:bundle_delivered_id', validate(bundleDeliveredIdSchema, 'params'), asyncHandler(bundleDeliveredController.getById));
router.post('/', validate(createBundleDeliveredSchema), asyncHandler(bundleDeliveredController.create));
router.patch(
  '/:bundle_delivered_id',
  validate(bundleDeliveredIdSchema, 'params'),
  validate(updateBundleDeliveredSchema),
  asyncHandler(bundleDeliveredController.update),
);
router.delete('/:bundle_delivered_id', validate(bundleDeliveredIdSchema, 'params'), asyncHandler(bundleDeliveredController.remove));

export default router;
