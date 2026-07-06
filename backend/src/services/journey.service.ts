import { ApiError } from "../utils/ApiError.js";
import type { Journey } from "../generated/prisma/client.js";
import type { CreateJourneyInput, UpdateJourneyInput } from "../types/journey.types.js";
import {
  createJourney as createJourneyInDb,
  findJourneysByOwner,
  findJourneyById,
  updateJourney as updateJourneyInDb,
  deleteJourney as deleteJourneyInDb,
} from "../repositories/journey.repository.js";
import { deleteImage } from "./cloudinary.service.js";

/**
 * Find a journey and ensure the requesting user is the owner.
 */
async function findOwnedJourney(id: string, ownerId: string): Promise<Journey> {
  const journey = await findJourneyById(id);

  if (!journey) {
    throw ApiError.notFound("Journey not found");
  }

  if (journey.ownerId !== ownerId) {
    throw ApiError.forbidden("You do not have access to this journey");
  }

  return journey;
}

export async function create(
  ownerId: string,
  input: CreateJourneyInput
): Promise<Journey> {
  return createJourneyInDb(ownerId, input);
}

export async function listByOwner(ownerId: string): Promise<Journey[]> {
  return findJourneysByOwner(ownerId);
}

export async function getById(
  id: string,
  ownerId: string
): Promise<Journey> {
  return findOwnedJourney(id, ownerId);
}

export async function update(
  id: string,
  ownerId: string,
  input: UpdateJourneyInput
): Promise<Journey> {
  const existingJourney = await findOwnedJourney(id, ownerId);

  // If cover image is being replaced/removed and old one has a Cloudinary public_id, delete it
  if (
    input.coverImage !== undefined &&
    input.coverImage !== existingJourney.coverImage &&
    existingJourney.coverImagePublicId
  ) {
    await deleteImage(existingJourney.coverImagePublicId);
  }

  return updateJourneyInDb(id, input);
}

export async function remove(
  id: string,
  ownerId: string
): Promise<Journey> {
  const journey = await findOwnedJourney(id, ownerId);

  // Delete cover image from Cloudinary if it has a public_id
  if (journey.coverImagePublicId) {
    await deleteImage(journey.coverImagePublicId);
  }

  return deleteJourneyInDb(id);
}
