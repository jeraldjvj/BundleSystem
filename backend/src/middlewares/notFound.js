import { HttpError } from '../utils/HttpError.js';

export const notFound = (req, _res, next) => {
  next(new HttpError(404, `Route ${req.method} ${req.originalUrl} not found`));
};
