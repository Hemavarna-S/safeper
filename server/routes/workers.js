import express from "express";
import Worker from "../models/Worker.js";
import { auditLogger } from "../middleware/auditLogger.js";
const router = express.Router();
router.post("/", auditLogger("CREATE_WORKER"), async (req, res) => {
  try {
    const worker = new Worker(req.body);
    await worker.save();
    res.json(worker);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/", async (req, res) => {
  const workers = await Worker.find();
  res.json(workers);
});
export default router;