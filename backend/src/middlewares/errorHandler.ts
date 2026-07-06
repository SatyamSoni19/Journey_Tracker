import type { Request, Response, NextFunction } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { env } from "../config/env.js";
import fs from "fs";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    message = mapPrismaError(err);
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided to database";
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (env.isDevelopment) {
    console.error("🔥 Error:", err);
    try {
      fs.appendFileSync("error.log", new Date().toISOString() + " - " + (err.stack || err.message) + "\n");
    } catch (e) {}
  }

  res
    .status(statusCode)
    .json(
      new ApiResponse(
        statusCode,
        message,
        errors ? { errors } : env.isDevelopment ? { stack: err.stack } : undefined
      )
    );
}

function mapPrismaError(err: Prisma.PrismaClientKnownRequestError): string {
  switch (err.code) {
    case "P2002":
      return `A record with this ${(err.meta?.target as string[])?.join(", ") ?? "value"} already exists`;
    case "P2025":
      return "Record not found";
    case "P2003":
      return "Invalid reference to related record";
    default:
      return "Database error occurred";
  }
}