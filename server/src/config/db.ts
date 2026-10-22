// import dotenv from "dotenv";
// dotenv.config();

// import mysql from "mysql2/promise";

// const pool = mysql.createPool({
//   host: process.env.DB_HOST as string,
//   user: process.env.DB_USER as string,
//   password: process.env.DB_PASSWORD as string,
//   database: process.env.DB_NAME as string,

//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
// });

// export default pool;

import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  port: Number(process.env.DB_PORT),
  password: process.env.DB_PASSWORD as string,
  database: process.env.DB_NAME as string,
});

export const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resumes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_title VARCHAR(255) NOT NULL,
        company_name VARCHAR(255) DEFAULT 'Target Company',
        job_description TEXT,
        match_score INTEGER DEFAULT 0,
        matching_skills TEXT[] DEFAULT '{}',
        missing_skills TEXT[] DEFAULT '{}',
        added_skills TEXT[] DEFAULT '{}',
        resume_content JSONB NOT NULL,
        pdf_url TEXT NOT NULL,
        cloudinary_public_id TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
      CREATE INDEX IF NOT EXISTS idx_resumes_created_at ON resumes(created_at DESC);
    `);
    console.log("Database tables initialized successfully");
  } catch (err) {
    console.error("Failed to initialize database tables:", err);
  } finally {
    client.release();
  }
};

export default pool;
