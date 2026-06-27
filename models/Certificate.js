import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  date: { type: String },
  image: { type: String },
  link: { type: String }
}, { timestamps: true });

export default mongoose.model("Certificate", CertificateSchema);