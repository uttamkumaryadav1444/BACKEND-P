import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import auth from "../middleware/auth.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('☁️ Cloudinary configured:', process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌');

// ✅ Configure Multer with Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return uniqueSuffix;
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// ✅ Base64 Upload Route - Cloudinary
router.post("/base64", auth, async (req, res) => {
  try {
    const { file, type } = req.body;
    
    console.log('📤 Base64 upload request received');
    console.log('📤 File type:', type);
    
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file, {
      folder: 'portfolio',
      resource_type: 'auto'
    });

    const fileUrl = result.secure_url;
    console.log('✅ File uploaded to Cloudinary:', fileUrl);
    
    res.json({ 
      success: true,
      message: "File uploaded successfully", 
      fileUrl: fileUrl,
      filename: result.public_id,
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

// ✅ Multer Upload Route (for local testing)
router.post("/", auth, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log('✅ File uploaded via multer:', req.file.path);
    res.json({ 
      message: "File uploaded successfully", 
      imageUrl: req.file.path,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Resume Upload Route
router.post("/resume", auth, upload.single("resume"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const resumeUrl = req.file.path;
    console.log('✅ Resume uploaded:', resumeUrl);
    res.json({ 
      message: "Resume uploaded successfully", 
      resumeUrl: resumeUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;