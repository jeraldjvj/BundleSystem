import { HttpError } from '../utils/HttpError.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new HttpError(400, 'Validation error', result.error.flatten()));
  }
  req[source] = result.data;
  next();
};
