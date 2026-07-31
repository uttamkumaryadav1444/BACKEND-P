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

// ✅ Resume Upload
router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    console.log('📄 Uploading resume:', req.file.originalname);
    
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

// ✅ GET - Get Resume URL (For View/Download)
router.get("/resume/url", async (req, res) => {
  try {
    // Get the latest resume from Cloudinary
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
    
    const resume = result.resources[0];
    res.json({
      success: true,
      resumeUrl: resume.secure_url,
      publicId: resume.public_id,
      createdAt: resume.created_at,
      fileName: resume.original_filename || 'Uttam_Kumar_Resume.pdf'
    });
  } catch (error) {
    console.error('❌ Error fetching resume:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ✅ GET - Download Resume (Direct download with headers)
router.get("/resume/download", async (req, res) => {
  try {
    // Get the latest resume from Cloudinary
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
    
    const resume = result.resources[0];
    const resumeUrl = resume.secure_url;
    
    console.log('📥 Downloading resume:', resumeUrl);
    
    // ✅ Fetch the PDF from Cloudinary
    const response = await fetch(resumeUrl);
    const buffer = await response.arrayBuffer();
    
    // ✅ Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="Uttam_Kumar_Resume.pdf"');
    res.setHeader('Content-Length', buffer.byteLength);
    
    // Send the PDF
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('❌ Resume download error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ✅ GET - View Resume (Open in new tab)
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
    
    const resume = result.resources[0];
    const resumeUrl = resume.secure_url;
    
    // ✅ Redirect to Cloudinary for viewing
    res.redirect(resumeUrl);
  } catch (error) {
    console.error('❌ Error viewing resume:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ✅ POST - Update Resume (Admin only)
router.put("/resume/update", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    // ✅ First, delete old resumes
    const searchResult = await cloudinary.search
      .expression('folder:portfolio/resumes AND resource_type:pdf')
      .execute();
    
    if (searchResult.resources && searchResult.resources.length > 0) {
      for (const resource of searchResult.resources) {
        await cloudinary.uploader.destroy(resource.public_id, { resource_type: 'pdf' });
        console.log('🗑️ Deleted old resume:', resource.public_id);
      }
    }
    
    // ✅ Upload new resume
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfolio/resumes',
      resource_type: 'auto',
      public_id: `resume_${Date.now()}`,
      access_mode: 'public',
      use_filename: true,
      unique_filename: false
    });

    const resumeUrl = result.secure_url;
    console.log('✅ New resume uploaded:', resumeUrl);
    
    // Clean up
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('⚠️ Could not delete temp file:', err.message);
    }
    
    res.json({ 
      success: true,
      message: "Resume updated successfully", 
      resumeUrl: resumeUrl
    });
  } catch (error) {
    console.error('❌ Resume update error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// ✅ DELETE - Delete Resume
router.delete("/resume", auth, async (req, res) => {
  try {
    const result = await cloudinary.search
      .expression('folder:portfolio/resumes AND resource_type:pdf')
      .execute();
    
    if (!result.resources || result.resources.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "No resume found to delete" 
      });
    }
    
    let deletedCount = 0;
    for (const resource of result.resources) {
      await cloudinary.uploader.destroy(resource.public_id, { resource_type: 'pdf' });
      deletedCount++;
      console.log('🗑️ Deleted resume:', resource.public_id);
    }
    
    res.json({
      success: true,
      message: `${deletedCount} resume(s) deleted successfully`
    });
  } catch (error) {
    console.error('❌ Resume delete error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router;