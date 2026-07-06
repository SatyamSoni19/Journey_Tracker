import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";
import type { JwtPayload } from "../types/auth.types.js";

export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

export function getAccessTokenMaxAgeMs(): number {
  return ms(env.JWT_ACCESS_EXPIRY as ms.StringValue);
}

export function getRefreshTokenMaxAgeMs(): number {
  return ms(env.JWT_REFRESH_EXPIRY as ms.StringValue);
}

export function getRefreshTokenExpiryDate(): Date {
  return new Date(Date.now() + getRefreshTokenMaxAgeMs());
}