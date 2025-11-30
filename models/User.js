import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  prenom: { type: String, required: true },
  nom: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ← Doit être required
  score: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);