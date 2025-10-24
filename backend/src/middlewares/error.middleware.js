// ...existing code...
export const errorHandler = (err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    ok: false,
    message: err.message || 'Internal Server Error',
  });
};
// ...existing code...