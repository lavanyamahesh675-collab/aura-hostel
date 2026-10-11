/**
 * Centralized Error Handling Middleware & 404 Route Handler
 */

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API Endpoint Not Found - [${req.method}] ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  console.error('🔥 [SERVER ERROR]:', err.stack || err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
