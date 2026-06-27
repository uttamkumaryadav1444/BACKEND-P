import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String },
  description: { type: String },
  currentlyStudying: { type: Boolean, default: false },
  grade: { type: String },
  location: { type: String },
  logo: { type: String }
}, { timestamps: true });

export default mongoose.model("Education", EducationSchema);