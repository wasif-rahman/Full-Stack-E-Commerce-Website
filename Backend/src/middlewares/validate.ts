import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import AppError from '../utils/AppError.js';

// Extend Express Request to allow modification of body, query, and params
declare global {
  namespace Express {
    interface Request {
      validatedBody?: any;
      validatedQuery?: any;
      validatedParams?: any;
    }
  }
}

// Enhanced validation middleware with better error handling and type safety
export const validateBody = <T extends z.ZodTypeAny>(
  schema: T
) => (req: Request, res: Response, next: NextFunction) => {
  try {
    // Parse and validate the body
    const parsedBody = schema.parse(req.body);
    // Store validated data in a custom property
    req.validatedBody = parsedBody;
    // Also update the original body for backward compatibility
    Object.assign(req.body, parsedBody);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');

      return next(new AppError(400, `Validation failed: ${message}`));
    }
    next(error);
  }
};

export const validateQuery = <T extends z.ZodTypeAny>(
  schema: T
) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedQuery = schema.parse(req.query);
    req.validatedQuery = parsedQuery;
    // Update original query for backward compatibility
    Object.assign(req.query, parsedQuery);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');

      return next(new AppError(400, `Query validation failed: ${message}`));
    }
    next(error);
  }
};

export const validateParams = <T extends z.ZodTypeAny>(
  schema: T
) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedParams = schema.parse(req.params);
    req.validatedParams = parsedParams;
    // Update original params for backward compatibility
    Object.assign(req.params, parsedParams);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');

      return next(new AppError(400, `Parameter validation failed: ${message}`));
    }
    next(error);
  }
};

// Combined validation for multiple parts of the request
export const validateRequest = <TBody = any, TQuery = any, TParams = any>({
  body,
  query,
  params,
}: {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}) => (req: Request, res: Response, next: NextFunction) => {
  try {
    if (body) {
      const parsedBody = body.parse(req.body);
      req.validatedBody = parsedBody;
      Object.assign(req.body, parsedBody);
    }

    if (query) {
      const parsedQuery = query.parse(req.query);
      req.validatedQuery = parsedQuery;
      Object.assign(req.query, parsedQuery);
    }

    if (params) {
      const parsedParams = params.parse(req.params);
      req.validatedParams = parsedParams;
      Object.assign(req.params, parsedParams);
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
      }));

      const message = errors.map((e) => `${e.field}: ${e.message}`).join('; ');

      return next(new AppError(400, `Request validation failed: ${message}`));
    }
    next(error);
  }
};

