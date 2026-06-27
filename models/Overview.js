import mongoose from "mongoose";

const OverviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  bio: { type: String, required: true },
  tagline: { type: String },
  profileImage: { type: String },
  resumeUrl: { type: String }
}, { timestamps: true });

export default mongoose.model("Overview", OverviewSchema);