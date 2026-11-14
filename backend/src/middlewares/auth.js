import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { HttpError } from '../utils/HttpError.js';

// Verifica el JWT del header Authorization y carga el usuario en req.user.
// Sustituye al header x-user-id, que podía falsificarse desde el cliente.
export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      throw new HttpError(401, 'Token de autenticación requerido');
    }

    let payload;
    try {
      payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    } catch {
      throw new HttpError(401, 'Sesión expirada o token inválido');
    }

    const [rows] = await pool.query('SELECT status, must_change_password, level_user, token_version FROM user WHERE user_id = ?', [payload.userId]);
    if (rows.length === 0 || rows[0].status !== 'active') {
      throw new HttpError(403, 'Cuenta inactiva. No puedes realizar cambios en el sistema.');
    }

    // Revocación: si la versión del token no coincide (la contraseña cambió),
    // la sesión queda invalidada aunque el JWT no haya expirado
    if (rows[0].token_version !== (payload.tv ?? -1)) {
      throw new HttpError(401, 'Sesión invalidada. Inicia sesión nuevamente.');
    }

    // Con contraseña temporal solo se permite cambiarla
    if (rows[0].must_change_password && req.path !== '/change-password') {
      throw new HttpError(403, 'Debes cambiar tu contraseña temporal antes de continuar.');
    }

    // El nivel se lee de la BD en cada petición: si el rol cambia, aplica de inmediato
    // aunque el token tenga el nivel anterior guardado
    req.user = { userId: payload.userId, levelUser: rows[0].level_user };
    next();
  } catch (error) {
    next(error);
  }
};
