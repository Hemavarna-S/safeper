import express from "express";
import Checklist from "../models/Checklist.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const checklist = new Checklist(req.body);
    await checklist.save();
    res.json(checklist);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/:type", async (req, res) => {
  const checklist = await Checklist.findOne({
    workType: req.params.type
  });
  res.json(checklist);
});
export default router;