import mongoose from "mongoose";

const AchievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: String },
  icon: { type: String, default: "fa-trophy" }
}, { timestamps: true });

export default mongoose.model("Achievement", AchievementSchema);