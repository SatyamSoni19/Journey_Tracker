import { prisma } from "../config/db.js";
export async function createRefreshToken(userId, tokenHash, expiresAt) {
    return prisma.refreshToken.create({
        data: { userId, tokenHash, expiresAt },
    });
}
export async function findRefreshTokenByHash(tokenHash) {
    return prisma.refreshToken.findUnique({
        where: { tokenHash },
    });
}
export async function revokeRefreshToken(id) {
    await prisma.refreshToken.update({
        where: { id },
        data: { revoked: true },
    });
}
export async function revokeAllUserRefreshTokens(userId) {
    await prisma.refreshToken.updateMany({
        where: { userId, revoked: false },
        data: { revoked: true },
    });
}
