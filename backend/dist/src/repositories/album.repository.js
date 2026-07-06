import { prisma } from "../config/db.js";
export async function createAlbumMedia(journeyId, data) {
    return prisma.media.create({
        data: {
            journeyId,
            type: data.type,
            publicId: data.publicId,
            secureUrl: data.secureUrl,
            resourceType: data.resourceType,
            format: data.format,
            width: data.width,
            height: data.height,
            duration: data.duration,
            bytes: data.bytes,
            caption: data.caption,
        },
    });
}
export async function findAlbumMediaByJourney(journeyId) {
    return prisma.media.findMany({
        where: { journeyId },
        orderBy: { createdAt: "desc" },
    });
}
export async function findAlbumMediaById(id) {
    return prisma.media.findUnique({
        where: { id },
    });
}
export async function deleteAlbumMedia(id) {
    return prisma.media.delete({
        where: { id },
    });
}
