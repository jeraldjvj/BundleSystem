import { Router } from 'express';
import bundleColorRoutes from './bundleColor.routes.js';
import bundleModelRoutes from './bundleModel.routes.js';
import projectRoutes from './project.routes.js';
import userRoutes from './user.routes.js';
import bundleRoutes from './bundle.routes.js';
import smartphoneColorRoutes from './smartphoneColor.routes.js';
import smartphoneModelRoutes from './smartphoneModel.routes.js';
import smartphoneRoutes from './smartphone.routes.js';
import bundleDeliveredRoutes from './bundleDelivered.routes.js';
import storeRoutes from './store.routes.js';
import userProfileRoutes from './userProfile.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/bundle-colors', bundleColorRoutes);
router.use('/bundle-models', bundleModelRoutes);
router.use('/projects', projectRoutes);
router.use('/users', userRoutes);
router.use('/bundles', bundleRoutes);
router.use('/smartphone-colors', smartphoneColorRoutes);
router.use('/smartphone-models', smartphoneModelRoutes);
router.use('/smartphones', smartphoneRoutes);
router.use('/bundle-delivered', bundleDeliveredRoutes);
router.use('/stores', storeRoutes);
router.use('/user-profiles', userProfileRoutes);

export default router;
