import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";
import { uploadImageHandler } from "../controllers/upload.controller.js";

const router = Router();

// All upload routes require authentication
router.use(authenticate);

// POST /api/v1/uploads/image
// Expects: multipart/form-data with field "image"
// Optional query param: ?folder=Journey_Tracker/journey-covers
router.post("/image", uploadSingle("image"), uploadImageHandler);

export default router;
