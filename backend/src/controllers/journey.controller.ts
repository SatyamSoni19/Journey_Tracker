import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import {
  create,
  listByOwner,
  getById,
  update,
  remove,
} from "../services/journey.service.js";
import { createJourneyFromAIPlan } from "../repositories/journey.repository.js";
import type { CreateJourneyInput, UpdateJourneyInput } from "../types/journey.types.js";

export const createJourney = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  console.log("=== BACKEND JOURNEY CREATION ===");
  console.log("Received payload:", req.body);

  const input = req.body as CreateJourneyInput;
  const journey = await create(req.user.id, input);

  console.log("Journey created successfully:", journey.id);

  res
    .status(201)
    .json(new ApiResponse(201, "Journey created successfully", { journey }));
});

export const getJourneys = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const journeys = await listByOwner(req.user.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Journeys fetched successfully", { journeys }));
});

export const getJourneyById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const journey = await getById(req.params.id as string, req.user.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Journey fetched successfully", { journey }));
});

export const updateJourney = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const input = req.body as UpdateJourneyInput;
  const journey = await update(req.params.id as string, req.user.id, input);

  res
    .status(200)
    .json(new ApiResponse(200, "Journey updated successfully", { journey }));
});

export const deleteJourney = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  await remove(req.params.id as string, req.user.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Journey deleted successfully", {}));
});

export const createFromAIPlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const aiPlanId = req.params.planId;
  const journey = await createJourneyFromAIPlan(req.user.id, aiPlanId);

  res.status(201).json(new ApiResponse(201, "Journey created from AI plan", { journey }));
});
