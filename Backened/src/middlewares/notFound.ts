// Purpose: Handle all routes that don’t exist in the app.
// Example: If user goes to /api/banana(but you don’t have this route),
// this middleware will create a 404 error and forward it to errorHandler.
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError.js';


export const notFound = (req: Request, res: Response, next: NextFunction) => {
  // Create a new AppError with:
  // - statusCode: 404 (Not Found)
  // - message: "Not Found - [requested URL]"
  next(new AppError(404, `Not Found - ${req.originalUrl}`));
};
