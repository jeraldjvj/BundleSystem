import { z } from 'zod';
import { HttpError } from '../utils/HttpError.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    return next(new HttpError(400, 'Validation error', z.flattenError(result.error)));
  }
  req[source] = result.data;
  next();
};
