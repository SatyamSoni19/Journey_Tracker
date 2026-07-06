import { prisma } from "../config/db.js";
import type { AIPlan, Prisma } from "../generated/prisma/client.js";
import type { AIPlannerResponse } from "../types/aiPlanner.types.js";

export async function createAIPlan(
  userId: string,
  prompt: string,
  destination: string,
  result: AIPlannerResponse,
  journeyId?: string
): Promise<AIPlan> {
  return prisma.aIPlan.create({
    data: {
      userId,
      prompt,
      destination,
      result: result as any,
      ...(journeyId && { journeyId }),
    },
  });
}

export async function findAIPlansByUser(userId: string): Promise<AIPlan[]> {
  return prisma.aIPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function findAIPlanById(id: string): Promise<AIPlan | null> {
  return prisma.aIPlan.findUnique({
    where: { id },
  });
}

export async function deleteAIPlan(id: string): Promise<AIPlan> {
  return prisma.aIPlan.delete({
    where: { id },
  });
}

export async function updateAIPlan(id: string, data: Prisma.AIPlanUpdateInput): Promise<AIPlan> {
  return prisma.aIPlan.update({
    where: { id },
    data,
  });
}
