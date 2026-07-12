import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { generateTripPlan, chatWithPlan } from "../services/aiPlanner.service.js";
import {
  createAIPlan,
  findAIPlansByUser,
  findAIPlanById,
  deleteAIPlan,
} from "../repositories/aiPlan.repository.js";
import type { AIPlannerRequest } from "../types/aiPlanner.types.js";

export const generatePlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const input = req.body as AIPlannerRequest;

  // Generate the plan via Gemini + Google Maps
  const plan = await generateTripPlan(input);

  // Save the plan
  const destination =
    input.destination || plan.tripSummary?.destination || "Unknown";

  const savedPlan = await createAIPlan(
    req.user.id,
    input.prompt,
    destination,
    plan,
    input.journeyId
  );

  res.status(201).json(
    new ApiResponse(201, "Trip plan generated successfully", {
      plan,
      planId: savedPlan.id,
    })
  );
});

export const listPlans = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const plans = await findAIPlansByUser(req.user.id);

  res.status(200).json(
    new ApiResponse(200, "Plans fetched successfully", { plans })
  );
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const plan = await findAIPlanById(req.params.id as string);

  if (!plan) throw ApiError.notFound("Plan not found");
  if (plan.userId !== req.user.id)
    throw ApiError.forbidden("You do not have access to this plan");

  res.status(200).json(
    new ApiResponse(200, "Plan fetched successfully", { plan })
  );
});

export const deletePlanHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const plan = await findAIPlanById(req.params.id as string);

  if (!plan) throw ApiError.notFound("Plan not found");
  if (plan.userId !== req.user.id)
    throw ApiError.forbidden("You do not have access to this plan");

  await deleteAIPlan(plan.id);

  res.status(200).json(
    new ApiResponse(200, "Plan deleted successfully")
  );
});

export const updatePlanHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const plan = await findAIPlanById(req.params.id as string);

  if (!plan) throw ApiError.notFound("Plan not found");
  if (plan.userId !== req.user.id)
    throw ApiError.forbidden("You do not have access to this plan");

  // Only import updateAIPlan dynamically if not top-level imported, or just import it at top.
  // We can just use the repository pattern
  const { updateAIPlan } = await import("../repositories/aiPlan.repository.js");
  const updatedPlan = await updateAIPlan(plan.id, { destination: req.body.destination });

  res.status(200).json(
    new ApiResponse(200, "Plan updated successfully", { plan: updatedPlan })
  );
});

export const generateChat = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const { journeyId, prompt, history } = req.body;
  if (!journeyId || !prompt) {
    throw ApiError.badRequest("journeyId and prompt are required");
  }

  // Import dynamically or ensure imported at top
  const { generateContextualChat } = await import("../services/aiPlanner.service.js");
  const responseText = await generateContextualChat(req.user.id, journeyId, prompt, history);

  res.status(200).json(
    new ApiResponse(200, "Chat generated successfully", { response: responseText })
  );
});

export const chatWithPlanHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();

  const planId = req.params.id as string;
  const { prompt, history } = req.body;

  if (!prompt) {
    throw ApiError.badRequest("prompt is required");
  }

  const plan = await findAIPlanById(planId);
  if (!plan) throw ApiError.notFound("Plan not found");
  if (plan.userId !== req.user.id)
    throw ApiError.forbidden("You do not have access to this plan");

  const responseText = await chatWithPlan(plan, prompt, history || []);

  res.status(200).json(
    new ApiResponse(200, "Chat response generated", { response: responseText })
  );
});
