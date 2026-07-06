import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadImage } from "../services/cloudinary.service.js";
export const uploadImageHandler = asyncHandler(async (req, res) => {
    if (!req.user)
        throw ApiError.unauthorized();
    if (!req.file) {
        throw ApiError.badRequest("No file provided");
    }
    const folder = req.query.folder || "Journey_Tracker/journey-covers";
    const result = await uploadImage(req.file.buffer, folder);
    res
        .status(200)
        .json(new ApiResponse(200, "Image uploaded successfully", result));
});
