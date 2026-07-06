import { prisma } from "../config/db.js";
import type { Media as AlbumMedia } from "../generated/prisma/client.js";
import type { CreateAlbumMediaInput } from "../types/album.types.js";

export async function createAlbumMedia(
  journeyId: string,
  data: CreateAlbumMediaInput
): Promise<AlbumMedia> {
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

export async function findAlbumMediaByJourney(journeyId: string): Promise<AlbumMedia[]> {
  return prisma.media.findMany({
    where: { journeyId },
    orderBy: { createdAt: "desc" },
  });
}

export async function findAlbumMediaById(id: string): Promise<AlbumMedia | null> {
  return prisma.media.findUnique({
    where: { id },
  });
}

export async function deleteAlbumMedia(id: string): Promise<AlbumMedia> {
  return prisma.media.delete({
    where: { id },
  });
}
