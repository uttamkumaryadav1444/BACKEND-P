import mongoose from "mongoose";

const NonTechSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String },
  description: { type: String }
}, { timestamps: true });

export default mongoose.model("NonTechSkill", NonTechSkillSchema);