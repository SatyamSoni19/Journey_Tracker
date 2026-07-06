import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError.js";

export function notFound(req: Request, res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}