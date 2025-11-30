import mongoose from "mongoose";

const zikrSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  userName: { type: String, required: true },
  zikrType: { 
    type: String, 
    
  },
  count: { type: Number, required: true },
  mode: { 
    type: String, 
    enum: ["unlimited", "fixed"],
    required: true 
  },
  target: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Zikr", zikrSchema);