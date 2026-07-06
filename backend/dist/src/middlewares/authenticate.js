import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { findUserById } from "../repositories/user.repository.js";
import { toSafeUser } from "../repositories/user.repository.js";
function extractToken(req) {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
        return authHeader.split(" ")[1];
    }
    return req.cookies?.accessToken;
}
export const authenticate = asyncHandler(async (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        throw ApiError.unauthorized("Authentication required");
    }
    const payload = verifyAccessToken(token);
    const user = await findUserById(payload.userId);
    if (!user) {
        throw ApiError.unauthorized("User no longer exists");
    }
    req.user = toSafeUser(user);
    next();
});
