import mongoose from "mongoose";

const ExperienceSchema = new mongoose.Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  description: { type: String, required: true },
  currentlyWorking: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Experience", ExperienceSchema);