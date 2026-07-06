import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { registerUser, loginUser, refreshAccessToken, logoutUser, } from "../services/auth.service.js";
import { env } from "../config/env.js";
import { getAccessTokenMaxAgeMs, getRefreshTokenMaxAgeMs } from "../utils/jwt.js";
function setAuthCookies(res, accessToken, refreshToken) {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
        maxAge: getAccessTokenMaxAgeMs(),
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: env.isProduction,
        sameSite: "lax",
        path: "/api/v1/auth", // only sent to auth routes, not every request
        maxAge: getRefreshTokenMaxAgeMs(),
    });
}
function clearAuthCookies(res) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
}
export const register = asyncHandler(async (req, res) => {
    const input = req.body;
    const user = await registerUser(input);
    res
        .status(201)
        .json(new ApiResponse(201, "User registered successfully", { user }));
});
export const login = asyncHandler(async (req, res) => {
    const input = req.body;
    const { user, accessToken, refreshToken } = await loginUser(input);
    setAuthCookies(res, accessToken, refreshToken);
    res
        .status(200)
        .json(new ApiResponse(200, "Login successful", { user, accessToken }));
});
export const getCurrentUser = asyncHandler(async (req, res) => {
    res
        .status(200)
        .json(new ApiResponse(200, "Current user fetched successfully", { user: req.user }));
});
export const refresh = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    if (!incomingRefreshToken) {
        throw ApiError.unauthorized("No refresh token provided");
    }
    const { user, accessToken, refreshToken } = await refreshAccessToken(incomingRefreshToken);
    setAuthCookies(res, accessToken, refreshToken);
    res
        .status(200)
        .json(new ApiResponse(200, "Token refreshed successfully", { user, accessToken }));
});
export const logout = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken;
    await logoutUser(incomingRefreshToken);
    clearAuthCookies(res);
    res.status(200).json(new ApiResponse(200, "Logged out successfully"));
});
