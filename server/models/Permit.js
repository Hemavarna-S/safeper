import mongoose from "mongoose";
const permitSchema = new mongoose.Schema({
    type:String,
    location:String,
    worker:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Worker"
    },
    checklist:[
        {
            item:String,
            completed:Boolean
        }
    ],
    status:{
        type:String,
        enum:["Pending","Approved","Active","Closed"],
        default:"Pending"
    },
    qrToken:String
},{timestamps:true});
export default mongoose.model("Permit",permitSchema);