import express from "express";
import jwt from "jsonwebtoken";
const router = express.Router();
router.post("/login", (req, res) => {
  const { username } = req.body;
  const token = jwt.sign(
    { username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
  res.json({ token });
});
export default router;