import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "../config/env.js";
import { ApiError } from "./ApiError.js";
export function generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRY,
    });
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, env.JWT_ACCESS_SECRET);
    }
    catch {
        throw ApiError.unauthorized("Invalid or expired token");
    }
}
export function getAccessTokenMaxAgeMs() {
    return ms(env.JWT_ACCESS_EXPIRY);
}
export function getRefreshTokenMaxAgeMs() {
    return ms(env.JWT_REFRESH_EXPIRY);
}
export function getRefreshTokenExpiryDate() {
    return new Date(Date.now() + getRefreshTokenMaxAgeMs());
}
