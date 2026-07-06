import { ApiError } from "../utils/ApiError.js";
import { createJourney as createJourneyInDb, findJourneysByOwner, findJourneyById, updateJourney as updateJourneyInDb, deleteJourney as deleteJourneyInDb, } from "../repositories/journey.repository.js";
import { deleteImage } from "./cloudinary.service.js";
/**
 * Find a journey and ensure the requesting user is the owner.
 */
async function findOwnedJourney(id, ownerId) {
    const journey = await findJourneyById(id);
    if (!journey) {
        throw ApiError.notFound("Journey not found");
    }
    if (journey.ownerId !== ownerId) {
        throw ApiError.forbidden("You do not have access to this journey");
    }
    return journey;
}
export async function create(ownerId, input) {
    return createJourneyInDb(ownerId, input);
}
export async function listByOwner(ownerId) {
    return findJourneysByOwner(ownerId);
}
export async function getById(id, ownerId) {
    return findOwnedJourney(id, ownerId);
}
export async function update(id, ownerId, input) {
    const existingJourney = await findOwnedJourney(id, ownerId);
    // If cover image is being replaced/removed and old one has a Cloudinary public_id, delete it
    if (input.coverImage !== undefined &&
        input.coverImage !== existingJourney.coverImage &&
        existingJourney.coverImagePublicId) {
        await deleteImage(existingJourney.coverImagePublicId);
    }
    return updateJourneyInDb(id, input);
}
export async function remove(id, ownerId) {
    const journey = await findOwnedJourney(id, ownerId);
    // Delete cover image from Cloudinary if it has a public_id
    if (journey.coverImagePublicId) {
        await deleteImage(journey.coverImagePublicId);
    }
    return deleteJourneyInDb(id);
}
