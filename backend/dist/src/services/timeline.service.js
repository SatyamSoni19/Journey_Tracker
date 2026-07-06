import { ApiError } from "../utils/ApiError.js";
import { findJourneyById } from "../repositories/journey.repository.js";
import { createTimelineEntry as createInDb, findTimelineEntriesByJourney as findManyInDb, findTimelineEntryById as findByIdInDb, updateTimelineEntry as updateInDb, deleteTimelineEntry as deleteInDb, } from "../repositories/timeline.repository.js";
async function verifyJourneyOwnership(journeyId, userId) {
    const journey = await findJourneyById(journeyId);
    if (!journey) {
        throw ApiError.notFound("Journey not found");
    }
    if (journey.ownerId !== userId) {
        throw ApiError.forbidden("You do not have access to this journey");
    }
}
async function verifyEntryOwnership(entryId, journeyId, userId) {
    await verifyJourneyOwnership(journeyId, userId);
    const entry = await findByIdInDb(entryId);
    if (!entry) {
        throw ApiError.notFound("Timeline entry not found");
    }
    if (entry.journeyId !== journeyId) {
        throw ApiError.badRequest("Entry does not belong to this journey");
    }
}
export async function createTimelineEntry(journeyId, userId, input) {
    await verifyJourneyOwnership(journeyId, userId);
    return createInDb(journeyId, input);
}
export async function getTimelineEntries(journeyId, userId) {
    await verifyJourneyOwnership(journeyId, userId);
    return findManyInDb(journeyId);
}
export async function updateTimelineEntry(entryId, journeyId, userId, input) {
    await verifyEntryOwnership(entryId, journeyId, userId);
    return updateInDb(entryId, input);
}
export async function deleteTimelineEntry(entryId, journeyId, userId) {
    await verifyEntryOwnership(entryId, journeyId, userId);
    return deleteInDb(entryId);
}
