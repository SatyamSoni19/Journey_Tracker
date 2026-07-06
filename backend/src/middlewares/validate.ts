import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";
import { ApiError } from "../utils/ApiError.js";

export function validate<T extends ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as { body?: unknown };

      req.body = parsed.body ?? req.body;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        next(ApiError.badRequest("Validation failed", formattedErrors));
        return;
      }
      next(error);
    }
  };
}