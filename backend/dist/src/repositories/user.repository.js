import { prisma } from "../config/db.js";
export async function findUserByEmail(email) {
    return prisma.user.findUnique({
        where: { email },
    });
}
export async function findUserById(id) {
    return prisma.user.findUnique({
        where: { id },
    });
}
export async function createUser(input) {
    return prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: input.password,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}
export function toSafeUser(user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...safeUser } = user;
    return safeUser;
}
