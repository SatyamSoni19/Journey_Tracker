import { prisma } from "../config/db.js";
import type { RefreshToken } from "../generated/prisma/client.js";

export async function createRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
): Promise<RefreshToken> {
  return prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });
}

export async function findRefreshTokenByHash(
  tokenHash: string
): Promise<RefreshToken | null> {
  return prisma.refreshToken.findUnique({
    where: { tokenHash },
  });
}

export async function revokeRefreshToken(id: string): Promise<void> {
  await prisma.refreshToken.update({
    where: { id },
    data: { revoked: true },
  });
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}