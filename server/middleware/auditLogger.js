import AuditLog from "../models/AuditLog.js";
export const auditLogger = (action) => async (req, res, next) => {
  try {
    await AuditLog.create({
      action,
      user: "system",
      changes: req.body
    });
  } catch (err) {
    console.log("Audit log error:", err.message);
  }
  next();
};