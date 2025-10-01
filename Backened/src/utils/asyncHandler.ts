import express from 'express';

//  asyncHandler middleware
// Purpose: To handle errors inside async functions (routes/controllers)
// without crashing the server. It automatically forwards errors to Express's error handler.

export const asyncHandler = (fn: any) =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Wrap the async function in a Promise
    // If it rejects (throws an error), `.catch(next)` sends the error
    // directly to our central error handler middleware.
    Promise.resolve(fn(req, res, next)).catch(next);
  };
