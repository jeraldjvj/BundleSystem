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
import reportRoutes from './report.routes.js';
import { pool } from '../config/database.js';
import { HttpError } from '../utils/HttpError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middlewares/auth.js';
import { loginLimiter, changePasswordLimiter } from '../middlewares/rateLimiter.js';
import { logAuthEvent } from '../utils/authLogger.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Hash dummy para que usuarios inexistentes tarden lo mismo que los reales (anti-enumeración)
const DUMMY_HASH = '$2b$10$C6UzMDM.H6dfI/f/IKcEeO7y5qO2z8Yl2e0n1o3sVf4bJ8g8F0g6G';

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const [users] = await pool.query(
      `SELECT u.*, up.first_name, up.last_name, up.profile_picture
       FROM user u
       LEFT JOIN user_profile up ON u.user_id = up.user_id
       WHERE u.email = ? OR u.mi_id = ?`,
      [email, email]
    );

    const user = users[0];
    const invalid = () => {
      logAuthEvent(req, email, 'credenciales_invalidas');
      throw new HttpError(401, 'Credenciales inválidas');
    };

    // Solo se aceptan contraseñas cifradas con bcrypt; un hash inválido cuenta como fallo.
    // Cuando el usuario no existe se compara contra el hash dummy para no revelarlo por el tiempo.
    const hashToCheck = user ? user.password_hash : DUMMY_HASH;
    const isPasswordValid = await bcrypt.compare(password, hashToCheck).catch(() => false);

    if (!user) {
      invalid();
    }

    // Usuario inactivo no puede iniciar sesión
    if (user.status !== 'active') {
      logAuthEvent(req, email, 'cuenta_inactiva');
      throw new HttpError(403, 'Cuenta inactiva. Contacta al administrador.');
    }

    // Bloqueo por intentos fallidos: máximo 5, se desbloquea al día siguiente
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      logAuthEvent(req, email, 'cuenta_bloqueada');
      throw new HttpError(403, 'Cuenta bloqueada por demasiados intentos fallidos. Intenta nuevamente mañana.');
    }

    if (!isPasswordValid) {
      const attempts = (user.failed_attempts || 0) + 1;
      if (attempts >= 5) {
        // Bloquear hasta mañana a las 00:00
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        await pool.query(
          'UPDATE user SET failed_attempts = 0, locked_until = ? WHERE user_id = ?',
          [tomorrow, user.user_id]
        );
        logAuthEvent(req, email, 'cuenta_bloqueada', `tras ${attempts} intentos`);
        throw new HttpError(403, 'Cuenta bloqueada por demasiados intentos fallidos. Intenta nuevamente mañana.');
      }
      await pool.query('UPDATE user SET failed_attempts = ? WHERE user_id = ?', [attempts, user.user_id]);
      logAuthEvent(req, email, 'contrasena_incorrecta', `intento ${attempts}/5`);
      throw new HttpError(401, `Credenciales inválidas. Te quedan ${5 - attempts} intento(s).`);
    }

    // Login exitoso: resetear contador y bloqueo
    if (user.failed_attempts > 0 || user.locked_until) {
      await pool.query('UPDATE user SET failed_attempts = 0, locked_until = NULL WHERE user_id = ?', [user.user_id]);
    }
    logAuthEvent(req, email, 'login_ok');

    // JWT firmado: identifica al usuario sin que el cliente pueda falsificarlo
    const token = jwt.sign(
      { userId: user.user_id, levelUser: user.level_user, tv: user.token_version },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      userId: user.user_id,
      miId: user.mi_id,
      email: user.email,
      status: user.status,
      levelUser: user.level_user,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture,
      mustChangePassword: Boolean(user.must_change_password),
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Todas las rutas siguientes requieren un JWT válido y un usuario activo
router.use(authenticate);

// Cambio de contraseña del usuario en sesión (requiere la contraseña actual)
router.post('/change-password', changePasswordLimiter, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw new HttpError(400, 'La contraseña actual y la nueva son requeridas');
    }
    if (String(newPassword).length < 6) {
      throw new HttpError(400, 'La nueva contraseña debe tener al menos 6 caracteres');
    }

    const [rows] = await pool.query('SELECT password_hash FROM user WHERE user_id = ?', [req.user.userId]);
    if (rows.length === 0) throw new HttpError(404, 'Usuario no encontrado');

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash).catch(() => false);
    if (!valid) throw new HttpError(400, 'La contraseña actual es incorrecta');

    if (await bcrypt.compare(newPassword, rows[0].password_hash).catch(() => false)) {
      throw new HttpError(400, 'La nueva contraseña debe ser diferente a la actual');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    // token_version + 1 invalida todas las sesiones anteriores de este usuario
    await pool.query(
      'UPDATE user SET password_hash = ?, must_change_password = 0, token_version = token_version + 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?',
      [hash, req.user.userId]
    );
    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

// Cierra todas las sesiones del usuario: token_version + 1 invalida los JWT emitidos
router.post('/logout', asyncHandler(async (req, res) => {
  await pool.query('UPDATE user SET token_version = token_version + 1 WHERE user_id = ?', [req.user.userId]);
  res.json({ message: 'Sesión cerrada' });
}));

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
router.use('/reports', reportRoutes);

export default router;
