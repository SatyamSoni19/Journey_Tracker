import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { create, listByOwner, getById, update, remove, } from "../services/journey.service.js";
export const createJourney = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const input = req.body;
    const journey = await create(req.user.id, input);
    res
        .status(201)
        .json(new ApiResponse(201, "Journey created successfully", { journey }));
});
export const getJourneys = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const journeys = await listByOwner(req.user.id);
    res
        .status(200)
        .json(new ApiResponse(200, "Journeys fetched successfully", { journeys }));
});
export const getJourneyById = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const journey = await getById(req.params.id, req.user.id);
    res
        .status(200)
        .json(new ApiResponse(200, "Journey fetched successfully", { journey }));
});
export const updateJourney = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const input = req.body;
    const journey = await update(req.params.id, req.user.id, input);
    res
        .status(200)
        .json(new ApiResponse(200, "Journey updated successfully", { journey }));
});
export const deleteJourney = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    await remove(req.params.id, req.user.id);
    res
        .status(200)
        .json(new ApiResponse(200, "Journey deleted successfully"));
});
