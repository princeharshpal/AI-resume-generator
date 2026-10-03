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

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(compression());
app.use(helmet());
app.use(globalRateLimiter);
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: `Backend is running | ${new Date()}`,
  });
});

app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/resume", resumeRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
