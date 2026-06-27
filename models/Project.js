import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  techStack: [{ type: String }],
  image: { type: String },
  liveLink: { type: String },
  githubLink: { type: String },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);