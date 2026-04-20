import express from "express";
import Permit from "../models/Permit.js";
import Checklist from "../models/Checklist.js";
const router = express.Router();
router.post("/", async (req, res) => {
  try {
    const { type, location, worker } = req.body;
    const template = await Checklist.findOne({ workType: type });
    const checklist = template.items.map(item => ({
      item,
      completed: false
    }));
    const qrToken = Math.random().toString(36).substring(2);
    const permit = new Permit({
      type,
      location,
      worker,
      checklist,
      qrToken
    });
    await permit.save();
    res.json(permit);

  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/", async (req, res) => {
  const permits = await Permit.find().populate("worker");
  res.json(permits);
});
export default router;