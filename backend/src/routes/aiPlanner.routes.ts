import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  generatePlanSchema,
  planIdParamSchema,
  updatePlanSchema,
} from "../validators/aiPlanner.validator.js";
import {
  generatePlan,
  listPlans,
  getPlan,
  deletePlanHandler,
  updatePlanHandler,
  generateChat,
} from "../controllers/aiPlanner.controller.js";

const router = Router();

// All AI routes require authentication
router.use(authenticate);

router.post("/plan", validate(generatePlanSchema), generatePlan);
router.post("/chat", generateChat);
router.get("/plans", listPlans);
router.get("/plans/:id", validate(planIdParamSchema), getPlan);
router.patch("/plans/:id", validate(updatePlanSchema), updatePlanHandler);
router.delete("/plans/:id", validate(planIdParamSchema), deletePlanHandler);

export default router;
