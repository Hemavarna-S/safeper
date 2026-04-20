import mongoose from "mongoose";
const auditSchema = new mongoose.Schema({
  action: String,
  user: String,
  changes: Object
}, { timestamps: true });
export default mongoose.model("AuditLog", auditSchema);