import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes";
import { globalRateLimiter } from "./middlewares/rateLimiter.middleware";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import errorHandler, { notFoundHandler } from "./middlewares/error.middleware";

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
    message: `Backend is running | ${new Date()}`,
  });
});

app.use("/api/users", userRoutes);

app.use("/api/analyse-resume", userRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
