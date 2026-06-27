import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  email: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  social: {
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    youtube: { type: String }
  }
}, { timestamps: true });

export default mongoose.model("Contact", ContactSchema);