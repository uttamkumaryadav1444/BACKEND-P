import express from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import auth from "../middleware/auth.js";
import dotenv from "dotenv";
import path from "path";
import fs from 'fs';

dotenv.config();

const router = express.Router();

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Missing',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Missing'
});

// Configure Multer
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

// ============================================================
// TEST ROUTE - To verify upload route is working
// ============================================================
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Upload route is working!",
    timestamp: new Date().toISOString()
  });
});

// ============================================================
// MAIN UPLOAD ROUTE - For images and files
// ============================================================
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

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfolio/uploads',
      resource_type: 'auto',
      public_id: `file_${Date.now()}`,
      access_mode: 'public'
    });

    console.log('✅ Upload successful:', result.secure_url);

    // Clean up temp file
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('Could not delete temp file:', err.message);
    }

    res.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Upload failed"
    });
  }
});

// ============================================================
// RESUME ROUTES
// ============================================================

// Upload Resume
router.post("/resume", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log('📄 Uploading resume:', req.file.originalname);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfolio/resumes',
      resource_type: 'auto',
      public_id: `resume_${Date.now()}`,
      access_mode: 'public'
    });

    const resumeUrl = result.secure_url;
    console.log('✅ Resume uploaded:', resumeUrl);

    // Clean up
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('Could not delete temp file:', err.message);
    }

    res.json({
      success: true,
      message: "Resume uploaded successfully",
      resumeUrl: resumeUrl
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get Resume URL
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
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Download Resume
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// View Resume
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Resume (Delete old, upload new)
router.put("/resume/update", auth, upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Delete old resumes
    const searchResult = await cloudinary.search
      .expression('folder:portfolio/resumes AND resource_type:pdf')
      .execute();

    if (searchResult.resources && searchResult.resources.length > 0) {
      for (const resource of searchResult.resources) {
        await cloudinary.uploader.destroy(resource.public_id, { resource_type: 'pdf' });
        console.log('Deleted old resume:', resource.public_id);
      }
    }

    // Upload new resume
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'portfolio/resumes',
      resource_type: 'auto',
      public_id: `resume_${Date.now()}`,
      access_mode: 'public'
    });

    const resumeUrl = result.secure_url;
    console.log('New resume uploaded:', resumeUrl);

    // Clean up
    try {
      fs.unlinkSync(req.file.path);
    } catch (err) {
      console.log('Could not delete temp file:', err.message);
    }

    res.json({
      success: true,
      message: "Resume updated successfully",
      resumeUrl: resumeUrl
    });
  } catch (error) {
    console.error('Resume update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete Resume
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
      console.log('Deleted resume:', resource.public_id);
    }

    res.json({
      success: true,
      message: `${deletedCount} resume(s) deleted successfully`
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;