import express from "express";
import Checklist from "../models/Checklist.js";
const router = express.Router();
router.get("/:type", async (req, res) => {
  const checklist = await Checklist.findOne({
    workType: req.params.type
  });
  res.json(checklist);
});
export default router;