import { ApiError } from "../utils/ApiError.js";
import { deleteImage } from "./cloudinary.service.js";
import { findJourneyById } from "../repositories/journey.repository.js";
import {
  createAlbumMedia as createInDb,
  findAlbumMediaByJourney as findManyInDb,
  findAlbumMediaById as findByIdInDb,
  deleteAlbumMedia as deleteInDb,
} from "../repositories/album.repository.js";
import type { CreateAlbumMediaInput } from "../types/album.types.js";

async function verifyJourneyOwnership(journeyId: string, userId: string) {
  const journey = await findJourneyById(journeyId);
  if (!journey) {
    throw ApiError.notFound("Journey not found");
  }
  if (journey.ownerId !== userId) {
    throw ApiError.forbidden("You do not have access to this journey");
  }
}

async function verifyMediaOwnership(mediaId: string, journeyId: string, userId: string) {
  await verifyJourneyOwnership(journeyId, userId);
  
  const media = await findByIdInDb(mediaId);
  if (!media) {
    throw ApiError.notFound("Album media not found");
  }
  if (media.journeyId !== journeyId) {
    throw ApiError.badRequest("Media does not belong to this journey");
  }
}

export async function addAlbumMedia(
  journeyId: string,
  userId: string,
  input: CreateAlbumMediaInput
) {
  await verifyJourneyOwnership(journeyId, userId);
  return createInDb(journeyId, input);
}

export async function getAlbumMedia(journeyId: string, userId: string) {
  await verifyJourneyOwnership(journeyId, userId);
  return findManyInDb(journeyId);
}

export async function deleteAlbumMedia(
  mediaId: string,
  journeyId: string,
  userId: string
) {
  const media = await findByIdInDb(mediaId);
  await verifyMediaOwnership(mediaId, journeyId, userId);
  
  if (media && media.publicId) {
    await deleteImage(media.publicId);
  }
  
  return deleteInDb(mediaId);
}
