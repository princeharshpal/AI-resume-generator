import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import cluster from "cluster";
import os from "os";
import pool from "./config/db.js";

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  console.log("Worker process", cluster.worker?.id);
}

pool.getConnection().then((conn) => {
  console.log("Connected to MySQL");
  conn.release();

  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});
