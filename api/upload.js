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
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('☁️ Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'
});

// ✅ Configure Multer - Use memory storage for Vercel
const storage = multer.memoryStorage(); // ✅ Changed to memoryStorage for Vercel

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only images and PDFs are allowed"));
    }
  }
});

// ✅ TEST ROUTE - To verify route is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "✅ Upload route is working!",
    timestamp: new Date().toISOString()
  });
});

// ✅ MAIN UPLOAD ROUTE - For images, certificates, gallery, etc.
router.post("/upload", auth, upload.single("file"), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('📄 File:', req.file.originalname);
    console.log('📦 Size:', req.file.size);
    console.log('📦 Type:', req.file.mimetype);

    // Convert buffer to base64 for Cloudinary
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'portfolio/uploads',
      resource_type: 'auto',
      public_id: `file_${Date.now()}`,
      access_mode: 'public'
    });

    console.log('✅ Upload successful:', result.secure_url);

    res.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Upload failed"
    });
  }
});

// ✅ Resume Upload
router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    console.log('📄 Uploading resume:', req.file.originalname);
    
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;
    
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'portfolio/resumes',
      resource_type: 'auto',
      public_id: `resume_${Date.now()}`,
      access_mode: 'public'
    });

    const resumeUrl = result.secure_url;
    console.log('✅ Resume uploaded:', resumeUrl);
    
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

// ✅ Get Resume URL
router.get("/resume/url", async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:portfolio/resumes AND resource_type:pdf')
      .sort_by('created_at', 'desc')
      .max_results(1)
      .execute();
    
    if (!result.resources || result.resources.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Resume not found" 
      });
    }
    
    res.json({
      success: true,
      resumeUrl: result.resources[0].secure_url
    });
  } catch (error) {
    console.error('❌ Error fetching resume:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ✅ Download Resume
router.get("/resume/download", async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:portfolio/resumes AND resource_type:pdf')
      .sort_by('created_at', 'desc')
      .max_results(1)
      .execute();
    
    if (!result.resources || result.resources.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Resume not found" 
      });
    }
    
    res.redirect(result.resources[0].secure_url);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ View Resume
router.get("/resume/view", async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:portfolio/resumes AND resource_type:pdf')
      .sort_by('created_at', 'desc')
      .max_results(1)
      .execute();
    
    if (!result.resources || result.resources.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Resume not found" 
      });
    }
    
    res.redirect(result.resources[0].secure_url);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;