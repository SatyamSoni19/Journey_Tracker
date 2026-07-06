import { prisma } from "../config/db.js";
import type { User } from "../generated/prisma/client.js";
import type { RegisterInput, SafeUser } from "../types/auth.types.js";

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createUser(
  input: RegisterInput & { password: string }
): Promise<SafeUser> {
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

export function toSafeUser(user: User): SafeUser {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...safeUser } = user;
  return safeUser;
}