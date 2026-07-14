import express from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import auth from "../middleware/auth.js";
import dotenv from "dotenv";
import path from "path";
import fs from 'fs';

dotenv.config();

const router = express.Router();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');

// ✅ Configure Multer for file uploads (temporary storage)
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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

// ============================================================
// ✅ ROUTE 1: Base64 Image Upload (for gallery, certificates, etc.)
// ============================================================
router.post("/", auth, async (req, res) => {
  try {
    const { file } = req.body;
    
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const result = await cloudinary.uploader.upload(file, {
      folder: 'portfolio',
      resource_type: 'auto'
    });

    res.json({ 
      success: true,
      fileUrl: result.secure_url,
      cloudinary: true
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ============================================================
// ✅ ROUTE 2: Resume Upload (PDF)
// ============================================================
router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // ✅ Upload to Cloudinary with PDF settings
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfolio/resumes',
      resource_type: 'auto',
      pages: true,
      use_filename: true,
      unique_filename: false
    });

    const resumeUrl = result.secure_url;
    console.log('✅ Resume uploaded to Cloudinary:', resumeUrl);
    
    // Clean up local file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('⚠️ Could not delete temp file:', err.message);
    }
    
    res.json({ 
      success: true,
      message: "Resume uploaded successfully", 
      resumeUrl: resumeUrl,
      filename: req.file.originalname,
      cloudinary: true
    });
  } catch (error) {
    console.error('❌ Resume upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ============================================================
// ✅ ROUTE 3: Regular Image Upload (for local testing)
// ============================================================
router.post("/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfolio/images',
      resource_type: 'auto'
    });

    // Clean up local file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('⚠️ Could not delete temp file:', err.message);
    }

    res.json({ 
      success: true,
      message: "Image uploaded successfully", 
      imageUrl: result.secure_url,
      cloudinary: true
    });
  } catch (error) {
    console.error('❌ Image upload error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;