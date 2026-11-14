import config from '../config/index.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  // Duplicados de clave única: respuesta genérica sin filtrar nombres de índice
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con ese identificador' });
  }
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 && config.env === 'production' ? 'Internal server error' : err.message,
    ...(err.details && { details: err.details }),
  });
};
