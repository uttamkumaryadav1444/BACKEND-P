import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  image: { type: String, required: true },
  date: { type: String },
  category: { 
    type: String, 
    enum: ["Award", "Event", "Conference", "Workshop", "Other"],
    default: "Other"
  },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("Gallery", GallerySchema);