import express from "express";
import Permit from "../models/Permit.js";
import Checklist from "../models/Checklist.js";
import QRCode from "qrcode";
import { auditLogger } from "../middleware/auditLogger.js";
const router = express.Router();
router.post("/", auditLogger("CREATE_PERMIT"), async (req, res) => {
  try {
    const { type, location, worker } = req.body;
    const template = await Checklist.findOne({ workType: type });
    const checklist = template.items.map(item => ({
      item,
      completed: false
    }));
    const qrToken = Math.random().toString(36).substring(2);
    const qrImage = await QRCode.toDataURL(qrToken);
    const permit = new Permit({
      type,
      location,
      worker,
      checklist,
      qrToken,
      qrImage
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
router.get("/verify/:qrToken", async (req, res) => {
  try {
    const permit = await Permit.findOne({ qrToken: req.params.qrToken }).populate("worker");

    if (!permit) {
      return res.status(404).json({ message: "Permit QR code was not found." });
    }

    res.json(permit);
  } catch (err) {
    res.status(500).json(err.message);
  }
});
router.get("/:id", async (req, res) => {
  const permit = await Permit.findById(req.params.id).populate("worker");
  res.json(permit);
});
router.patch("/:id/status", auditLogger("UPDATE_PERMIT"), async (req, res) => {
  const permit = await Permit.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  ).populate("worker");
  res.json(permit);
});
export default router;
