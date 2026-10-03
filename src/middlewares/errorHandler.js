import config from '../config/index.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);
  res.status(status).json({
    error: status >= 500 && config.env === 'production' ? 'Internal server error' : err.message,
    ...(err.details && { details: err.details }),
  });
};
