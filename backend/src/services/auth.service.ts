import { ApiError } from "../utils/ApiError.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateAccessToken, getRefreshTokenExpiryDate } from "../utils/jwt.js";
import { generateRandomToken, hashToken } from "../utils/tokenCrypto.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  toSafeUser,
} from "../repositories/user.repository.js";
import {
  createRefreshToken,
  findRefreshTokenByHash,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
} from "../repositories/refreshToken.repository.js";
import type {
  RegisterInput,
  LoginInput,
  SafeUser,
  AuthResult,
} from "../types/auth.types.js";

async function issueTokenPair(userId: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  const accessToken = generateAccessToken({ userId });

  const refreshToken = generateRandomToken();
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = getRefreshTokenExpiryDate();

  await createRefreshToken(userId, refreshTokenHash, expiresAt);

  return { accessToken, refreshToken };
}

export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const hashedPassword = await hashPassword(input.password);

  const newUser = await createUser({
    ...input,
    password: hashedPassword,
  });

  return newUser;
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const { accessToken, refreshToken } = await issueTokenPair(user.id);
  const safeUser = toSafeUser(user);

  return { user: safeUser, accessToken, refreshToken };
}

export async function refreshAccessToken(
  incomingRefreshToken: string
): Promise<AuthResult> {
  const tokenHash = hashToken(incomingRefreshToken);
  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  if (storedToken.revoked || storedToken.expiresAt < new Date()) {
    // Reuse of a revoked/expired token is suspicious — kill every session for this user.
    await revokeAllUserRefreshTokens(storedToken.userId);
    throw ApiError.unauthorized("Refresh token expired or already used. Please log in again.");
  }

  // Rotation: this token is now used, revoke it immediately.
  await revokeRefreshToken(storedToken.id);

  const user = await findUserById(storedToken.userId);

  if (!user) {
    throw ApiError.unauthorized("User no longer exists");
  }

  const { accessToken, refreshToken } = await issueTokenPair(user.id);
  const safeUser = toSafeUser(user);

  return { user: safeUser, accessToken, refreshToken };
}

export async function logoutUser(incomingRefreshToken: string | undefined): Promise<void> {
  if (!incomingRefreshToken) {
    return;
  }

  const tokenHash = hashToken(incomingRefreshToken);
  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (storedToken) {
    await revokeRefreshToken(storedToken.id);
  }
}