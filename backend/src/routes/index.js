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
import distributorRoutes from './distributor.routes.js';
import { pool } from '../config/database.js';
import { HttpError } from '../utils/HttpError.js';
import bcrypt from 'bcrypt';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const [users] = await pool.query(
      `SELECT u.*, up.first_name, up.last_name, up.profile_picture
       FROM user u
       LEFT JOIN user_profile up ON u.user_id = up.user_id
       WHERE u.email = ?`,
      [email]
    );

    if (users.length === 0) {
      throw new HttpError(401, 'Invalid credentials');
    }

    const user = users[0];

    // Verify password hash - if not hashed, try direct comparison for migration
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password_hash);
    } catch (error) {
      // If bcrypt.compare fails, it might be a plain text password (old format)
      isPasswordValid = (password === user.password_hash);
    }
    
    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid credentials');
    }

    res.json({
      userId: user.user_id,
      miId: user.mi_id,
      email: user.email,
      status: user.status,
      levelUser: user.level_user,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture,
    });
  } catch (error) {
    next(error);
  }
});

// Temporary endpoint to migrate plain text passwords to bcrypt hashes
router.post('/migrate-passwords', async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT user_id, password_hash FROM user');
    
    let migratedCount = 0;
    const errors = [];

    for (const user of users) {
      try {
        // Check if password is already hashed (bcrypt hashes start with $2b$ or $2a$)
        const isHashed = user.password_hash.startsWith('$2');
        
        if (!isHashed) {
          const hashedPassword = await bcrypt.hash(user.password_hash, 10);
          await pool.query(
            'UPDATE user SET password_hash = ? WHERE user_id = ?',
            [hashedPassword, user.user_id]
          );
          migratedCount++;
        }
      } catch (error) {
        errors.push(`User ${user.user_id}: ${error.message}`);
      }
    }

    res.json({
      message: `Migrated ${migratedCount} passwords to bcrypt hashes`,
      totalUsers: users.length,
      errors: errors
    });
  } catch (error) {
    next(error);
  }
});

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
router.use('/distributors', distributorRoutes);

export default router;
