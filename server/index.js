import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import permitRoutes from "./routes/permits.js";
import checklistRoutes from "./routes/checklists.js";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());  
app.use("/api/permits", permitRoutes);
app.use("/api/checklists", checklistRoutes);c
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));
app.get("/", (req, res) => {
  res.send("API running");
});
app.listen(5000, () => {
  console.log("Server Port 5000");
});