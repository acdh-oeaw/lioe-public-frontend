import { HttpError } from "@acdh-oeaw/lib";
import { type ErrorRequestHandler } from "express";

export class ServerError extends Error {
  name = "ServerError";

  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const errorHandler: ErrorRequestHandler = function errorHandler(
  error,
  _req,
  res,
  next
) {
  if (res.headersSent) {
    return next(error);
  }

  const { message, statusCode } =
    error instanceof HttpError
      ? {
          message: error.response.statusText,
          statusCode: error.response.status,
        }
      : error instanceof ServerError
      ? { message: error.message, statusCode: error.statusCode }
      : { message: "Internal server error", statusCode: 500 };

  return res.status(statusCode).send({ message });
};
