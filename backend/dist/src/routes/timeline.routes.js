import { Router } from "express";
import { createTimelineEntry, getTimelineEntries, updateTimelineEntry, deleteTimelineEntry, } from "../controllers/timeline.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createTimelineEntrySchema, updateTimelineEntrySchema, timelineEntryIdParamSchema, } from "../validators/timeline.validator.js";
// Note: This router will be mounted at /api/v1/journeys/:journeyId/timeline
const router = Router({ mergeParams: true });
router.use(authenticate);
router.post("/", validate(createTimelineEntrySchema), createTimelineEntry);
router.get("/", getTimelineEntries);
router.patch("/:entryId", validate(updateTimelineEntrySchema), updateTimelineEntry);
router.delete("/:entryId", validate(timelineEntryIdParamSchema), deleteTimelineEntry);
export default router;
