import express from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import auth from "../middleware/auth.js";
import dotenv from "dotenv";
import path from "path";
import fs from 'fs';

dotenv.config();

const router = express.Router();

// ✅ Cloudinary Config - FIXED
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true  // ✅ Add this
});

console.log('☁️ Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'
});

// ✅ Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"));
    }
  }
});

// ✅ Resume Upload - FIXED
router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    console.log('📄 Uploading resume:', req.file.originalname);
    
    // ✅ Upload with proper options
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfolio/resumes',
      resource_type: 'auto',
      public_id: `resume_${Date.now()}`,
      access_mode: 'public',
      use_filename: true,
      unique_filename: false
    });

    const resumeUrl = result.secure_url;
    console.log('✅ Resume uploaded:', resumeUrl);
    
    // Clean up
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('⚠️ Could not delete temp file:', err.message);
    }
    
    res.json({ 
      success: true,
      message: "Resume uploaded successfully", 
      resumeUrl: resumeUrl
    });
  } catch (error) {
    console.error('❌ Resume upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;