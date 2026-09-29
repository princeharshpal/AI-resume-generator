import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // const users = await prisma.user.findMany();

    // res.json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users"
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    // const user = await prisma.user.create({
    //   data: {
    //     name,
    //     email
    //   }
    // });

    // res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user"
    });
  }
});

export default router;
