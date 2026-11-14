import { Router } from 'express';
import { bundleController } from '../controllers/bundle.controller.js';
import { validate } from '../middlewares/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/requireRole.js';
import { lookupLimiter } from '../middlewares/rateLimiter.js';
import {
  bundleIdSchema,
  createBundleSchema,
  updateBundleSchema,
  assignBundleSchema,
} from '../schemas/bundle.schema.js';

const router = Router();

router.get('/', asyncHandler(bundleController.getAll));
router.get('/verify-serial/:serial', lookupLimiter, asyncHandler(bundleController.verifySerial));
router.get('/transfers/pending', asyncHandler(bundleController.pendingTransfers));
router.get('/transfers/outgoing', asyncHandler(bundleController.outgoingTransfers));
router.get('/transfers/history/all', asyncHandler(bundleController.allTransferHistory));
router.get('/transfers/history', asyncHandler(bundleController.transferHistory));
router.get('/:bundle_id', validate(bundleIdSchema, 'params'), asyncHandler(bundleController.getById));
router.post('/', requireRole('Office Manager'), validate(createBundleSchema), asyncHandler(bundleController.create));
router.post(
  '/:bundle_id/assign',
  validate(bundleIdSchema, 'params'),
  validate(assignBundleSchema),
  asyncHandler(bundleController.assign),
);
router.post(
  '/:bundle_id/transfer-request',
  validate(bundleIdSchema, 'params'),
  validate(assignBundleSchema),
  asyncHandler(bundleController.requestTransfer),
);
router.post('/transfers/:transfer_history_id/approve', asyncHandler(bundleController.resolveTransfer));
router.post('/transfers/:transfer_history_id/reject', asyncHandler(bundleController.resolveTransfer));
router.post('/transfers/:transfer_history_id/cancel', asyncHandler(bundleController.cancelTransfer));
router.patch(
  '/:bundle_id',
  requireRole('Office Manager'),
  validate(bundleIdSchema, 'params'),
  validate(updateBundleSchema),
  asyncHandler(bundleController.update),
);
router.delete('/:bundle_id', requireRole('Office Manager'), validate(bundleIdSchema, 'params'), asyncHandler(bundleController.remove));

export default router;
