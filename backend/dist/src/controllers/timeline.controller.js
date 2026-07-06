import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { createTimelineEntry as createService, getTimelineEntries as getListService, updateTimelineEntry as updateService, deleteTimelineEntry as deleteService, } from "../services/timeline.service.js";
export const createTimelineEntry = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const journeyId = req.params.journeyId;
    const input = req.body;
    const entry = await createService(journeyId, req.user.id, input);
    res.status(201).json(new ApiResponse(201, "Timeline entry created", { entry }));
});
export const getTimelineEntries = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const journeyId = req.params.journeyId;
    const entries = await getListService(journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Timeline entries fetched", { entries }));
});
export const updateTimelineEntry = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const journeyId = req.params.journeyId;
    const entryId = req.params.entryId;
    const input = req.body;
    const entry = await updateService(entryId, journeyId, req.user.id, input);
    res.status(200).json(new ApiResponse(200, "Timeline entry updated", { entry }));
});
export const deleteTimelineEntry = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    const journeyId = req.params.journeyId;
    const entryId = req.params.entryId;
    await deleteService(entryId, journeyId, req.user.id);
    res.status(200).json(new ApiResponse(200, "Timeline entry deleted"));
});
