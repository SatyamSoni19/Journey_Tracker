import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
const router = Router();
router.get("/", (req, res) => {
    res
        .status(200)
        .json(new ApiResponse(200, "Journey Tracker API is healthy", {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }));
});
export default router;
