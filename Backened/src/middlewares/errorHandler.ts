// 🔹 errorHandler Middleware
// - Centralized error response handler in Express.
// - Takes AppError (from errorConverter) as input.
// - Extracts statusCode → default 500 if missing.
// - Builds JSON response:
//     • success: false (always, since it's an error)
//     • message: error message or "Internal Server Error"
//     • stack: only included in development mode for debugging
// - Sends response with res.status(statusCode).json(response)
// - Ensures client always receives a consistent error format.
import type { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(statusCode).json(response);
};
