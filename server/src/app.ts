import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";
import helmet from "helmet";
const app = express();

app.use(helmet());
app.use(globalRateLimiter);
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


export default app;
