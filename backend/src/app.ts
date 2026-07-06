import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import journeyRoutes from "./routes/journey.routes.js";
import timelineRoutes from "./routes/timeline.routes.js";
import albumRoutes from "./routes/album.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import placesRoutes from "./routes/places.routes.js";
import aiPlannerRoutes from "./routes/aiPlanner.routes.js";

const app: Application = express();

// ─── Security & Parsing Middleware ──────────────────────
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging ─────────────────────────────────────────────
if (env.isDevelopment) {
  app.use(morgan("dev"));
}

// ─── Routes ──────────────────────────────────────────────
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/journeys", journeyRoutes);
app.use("/api/v1/journeys/:journeyId/timeline", timelineRoutes);
app.use("/api/v1/journeys/:journeyId/album", albumRoutes);
app.use("/api/v1/journeys/:journeyId/budget", budgetRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/uploads", uploadRoutes);
app.use("/api/v1/places", placesRoutes);
app.use("/api/v1/ai", aiPlannerRoutes);

// ─── Error Handling (must be last) ──────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;