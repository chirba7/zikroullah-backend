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
    default: "Allahou Akbar",
    enum: ["Allahou Akbar", "Soubhanallah", "Alhamdoulillah", "La ilaha illa Allah"]
  },
  count: { type: Number, required: true },
  mode: { 
    type: String, 
    enum: ["unlimited", "fixed"],
    required: true 
  },
  target: { type: Number, default: 0 },
  duration: { type: Number, default: 0 }, // en minutes
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Zikr", zikrSchema);