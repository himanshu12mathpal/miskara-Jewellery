export const notFound = (req, res, next) => {
  const error = new Error(`Not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  // If headers already sent, delegate to default Express error handler
  if (res.headersSent) return next(err);

  // Ensure CORS headers are present even on error responses
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  const statusCode = res.statusCode && res.statusCode !== 200
    ? res.statusCode
    : err.status || 500;

  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Never expose stack traces in production
    ...(isProd ? {} : { stack: err.stack }),
  });
};
