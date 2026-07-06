import { Router } from "express";
import { addAlbumMedia, getAlbumMedia, deleteAlbumMedia, } from "../controllers/album.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate } from "../middlewares/authenticate.js";
import { createAlbumMediaSchema, albumMediaIdParamSchema, } from "../validators/album.validator.js";
// Mounted at /api/v1/journeys/:journeyId/album
const router = Router({ mergeParams: true });
router.use(authenticate);
router.post("/", validate(createAlbumMediaSchema), addAlbumMedia);
router.get("/", getAlbumMedia);
router.delete("/:mediaId", validate(albumMediaIdParamSchema), deleteAlbumMedia);
export default router;
