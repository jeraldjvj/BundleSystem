import rateLimit from 'express-rate-limit';

// Limita intentos de login por IP: frena fuerza bruta y password spraying
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos desde esta red. Espera 15 minutos y vuelve a intentar.' },
});

// Limita subidas de fotos para evitar llenar el disco del servidor
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas subidas de archivos. Espera 15 minutos y vuelve a intentar.' },
});

// Limita consultas que permiten enumerar datos (MI IDs, seriales, IMEIs)
export const lookupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas consultas. Espera 15 minutos y vuelve a intentar.' },
});

// Limita intentos de cambio de contraseña por IP + usuario
export const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de cambio de contraseña. Espera 15 minutos y vuelve a intentar.' },
});
