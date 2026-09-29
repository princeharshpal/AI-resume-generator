import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ extended: true, limit: "40kb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Backend is running!",
  });
});

app.use("/api/users", userRoutes);

export default app;
