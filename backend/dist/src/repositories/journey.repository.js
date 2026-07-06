import { prisma } from "../config/db.js";
export async function createJourney(ownerId, data) {
    return prisma.journey.create({
        data: {
            title: data.title,
            destination: data.destination,
            description: data.description,
            coverImage: data.coverImage,
            coverImagePublicId: data.coverImagePublicId,
            budget: data.budget,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            status: data.status ?? "PLANNED",
            ownerId,
        },
    });
}
export async function findJourneysByOwner(ownerId) {
    return prisma.journey.findMany({
        where: { ownerId },
        orderBy: { startDate: "asc" },
    });
}
export async function findJourneyById(id) {
    return prisma.journey.findUnique({
        where: { id },
    });
}
export async function updateJourney(id, data) {
    return prisma.journey.update({
        where: { id },
        data: {
            ...(data.title !== undefined && { title: data.title }),
            ...(data.destination !== undefined && { destination: data.destination }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
            ...(data.coverImagePublicId !== undefined && { coverImagePublicId: data.coverImagePublicId }),
            ...(data.budget !== undefined && { budget: data.budget }),
            ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
            ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
            ...(data.status !== undefined && { status: data.status }),
        },
    });
}
export async function deleteJourney(id) {
    return prisma.journey.delete({
        where: { id },
    });
}
