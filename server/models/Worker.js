import mongoose from "mongoose";
const workerSchema = new mongoose.Schema({
  name: String,
  role: String,
  certifications: [
    {
      name: String,
      expiryDate: Date
    }
  ]
});
export default mongoose.model("Worker", workerSchema);