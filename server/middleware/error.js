import logger from '../utils/logger.js';
import config from '../config/index.js';


export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}


export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Log error details
  if (statusCode >= 500) {
    logger.error('Server error:', {
      error: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
  } else {
    logger.warn('Client error:', {
      statusCode,
      error: err.message,
      path: req.path,
      method: req.method,
    });
  }


  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal Server Error' : err.message,
    message: statusCode >= 500 && config.server.env !== 'development' 
      ? 'Something went wrong!'
      : err.message,
    ...(config.server.env === 'development' && { stack: err.stack }),
  });
};


export const handleUncaughtErrors = () => {
  // Unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection:', { reason, promise });
  });

  // Uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    
    // Exit with failure - for non-operational errors
    if (!(error instanceof ApiError) || !error.isOperational) {
      process.exit(1);
    }
  });
}; 