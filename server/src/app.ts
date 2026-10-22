import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";

import userRoutes from "./routes/user.routes";
import { globalRateLimiter } from "./middlewares/rateLimiter.middleware";
import errorHandler, { notFoundHandler } from "./middlewares/error.middleware";
import uploadRoutes from "./routes/upload.routes";
import resumeRoutes from "./routes/resume.routes";

const app = express();

app.disable("x-powered-by");

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use(globalRateLimiter);
app.use(cookieParser());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation: Origin not allowed"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resume", resumeRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
