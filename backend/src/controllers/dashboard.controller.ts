import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getGlobalDashboardSummary } from "../services/dashboard.service.js";

export const getDashboardSummary = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const summary = await getGlobalDashboardSummary(req.user.id);
  res.status(200).json(new ApiResponse(200, "Dashboard summary fetched", { summary }));
});
