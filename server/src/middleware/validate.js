/** Middleware validate body bằng zod; dữ liệu đã parse được gán lại vào req.body. */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) return next(result.error);
  req.body = result.data;
  return next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query ?? {});
  if (!result.success) return next(result.error);
  req.validatedQuery = result.data;
  return next();
};
