import { Router } from "express";
import { createJourney, getJourneys, getJourneyById, updateJourney, deleteJourney, } from "../controllers/journey.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createJourneySchema, updateJourneySchema, journeyIdParamSchema, } from "../validators/journey.validator.js";
const router = Router();
// All journey routes require authentication
router.use(authenticate);
router.post("/", validate(createJourneySchema), createJourney);
router.get("/", getJourneys);
router.get("/:id", validate(journeyIdParamSchema), getJourneyById);
router.patch("/:id", validate(updateJourneySchema), updateJourney);
router.delete("/:id", validate(journeyIdParamSchema), deleteJourney);
export default router;
