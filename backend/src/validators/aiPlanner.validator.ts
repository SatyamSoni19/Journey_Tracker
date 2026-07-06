import { z } from "zod";

export const generatePlanSchema = z.object({
  body: z.object({
    prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt is too long"),
    destination: z.string().optional(),
    budget: z.number().positive().optional(),
    days: z.number().int().min(1).max(30).optional(),
    travelStyle: z.enum(["budget", "mid-range", "luxury", "backpacker"]).optional(),
    interests: z.array(z.string()).optional(),
    groupType: z.enum(["solo", "couple", "family", "friends"]).optional(),
    journeyId: z.string().optional(),
    currency: z.string().optional(),
  }),
});

export const planIdParamSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Plan ID is required"),
  }),
});

export const updatePlanSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Plan ID is required"),
  }),
  body: z.object({
    destination: z.string().min(1, "Name is required").max(100, "Name is too long"),
  }),
});
