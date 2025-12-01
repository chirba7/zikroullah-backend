import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  score: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'pending'], 
    default: 'active' 
  }
});

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [memberSchema]
}, { timestamps: true });

export default mongoose.model("Group", groupSchema);