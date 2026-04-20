import mongoose from "mongoose";
const checklistSchema = new mongoose.Schema({
    workType:String,
    items:[String]
});
export default mongoose.model("Checklist",checklistSchema);