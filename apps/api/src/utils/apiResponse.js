
export const sendSuccess = (
  res,
  { statusCode = 200, message = "OK", data = {}, meta = {} } = {}
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
    meta,
  });
};

export const sendError = (
  res,
  {
    statusCode = 500,
    code = "INTERNAL_SERVER_ERROR",
    message = "Something went wrong",
    fields,
  } = {}
) => {
  const error = { code, message };

  if (fields) {
    error.fields = fields;
  }

  return res.status(statusCode).json({
    success: false,
    error,
  });
};
