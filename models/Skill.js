import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, required: true },
  category: { type: String, enum: ["frontend", "backend", "tools", "other"], default: "other" },
  percentage: { type: Number, min: 0, max: 100, default: 80 }
}, { timestamps: true });

export default mongoose.model("Skill", SkillSchema);