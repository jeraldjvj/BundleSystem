import { Router } from 'express';
import bundleRoutes from './bundle.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/bundles', bundleRoutes);

export default router;
