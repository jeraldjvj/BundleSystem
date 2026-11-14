import { HttpError } from '../utils/HttpError.js';

// Restringe una ruta a los niveles indicados. El nivel se lee de req.user,
// que el middleware authenticate carga siempre desde la base de datos.
export const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!allowedRoles.includes(req.user?.levelUser)) {
    return next(new HttpError(403, 'No tienes permisos para realizar esta acción.'));
  }
  next();
};
