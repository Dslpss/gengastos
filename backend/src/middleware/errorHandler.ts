import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message } = error;

  // Log error
  console.error(`Error ${statusCode}: ${message}`);
  console.error(error.stack);

  // Don't leak error details in production
  if (process.env.NODE_ENV === "production" && !error.isOperational) {
    message = "Something went wrong";
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    },
  });
};

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
