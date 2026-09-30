import type { Response, Request } from "express";
import AsyncWrapper from "../utils/asyncWrapper.js";
import pool from "../config/db.js";

const getUser = AsyncWrapper(async (req: Request, res: Response) => {
  const query = "SELECT * FROM users";
  const rows = await pool.query(query);
  res.json(rows);
});

const createUser = AsyncWrapper(async (req: Request, res: Response) => {
  const { name, email } = req.body;

  // const user = await prisma.user.create({
  //   data: {
  //     name,
  //     email
  //   }
  // });

  // res.status(201).json(user);
});

export { getUser, createUser };
