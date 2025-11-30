import mongoose from "mongoose";

const zikrSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group" },
  zikr: String,
  score: Number,
  date: String
});

export default mongoose.model("ZikrHistory", zikrSchema);
