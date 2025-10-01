// 🔥 AppError Class
// Used to create consistent error objects across the app.
// Helps send proper HTTP responses (statusCode, message, stack).
// Works with error middlewares (errorConverter & errorHandler).

export default class AppError extends Error {
  statusCode: number;       // Stores HTTP status code (e.g. 404, 500, etc.)
  isOperational: boolean;   // Marks if error is expected (true) or a bug/system error (false)

  constructor(statusCode: number, message: string, isOperational = true, stack = '') {
    // Call parent class (Error) constructor with message
    super(message);

    // Attach custom properties
    this.statusCode = statusCode;         
    this.isOperational = isOperational;   

    // If a stack trace is provided → use it, else generate one
    if (stack) {
      this.stack = stack;
    } else {
      // captureStackTrace shows where the error happened in code
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

