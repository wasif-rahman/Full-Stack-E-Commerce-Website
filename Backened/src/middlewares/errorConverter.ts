// 🔹 errorConverter Middleware
// - Express middleware to normalize all errors into AppError format.
// - If error is already an AppError → keep it as is.
// - If error is not an AppError → wrap it inside AppError.
// - Ensures every error has: statusCode, message, stack.
// - Calls next(error) → forwards to final errorHandler middleware.
import { Request,Response, NextFunction }  from 'express';
import AppError from '../utils/AppError.js';
export const errorConverter = (err: any, req: Request, res: Response, next: NextFunction) => {
let error = err;
if (!(error instanceof AppError)){
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new AppError(statusCode, message, false, error.stack);  
}
next(error);
};
