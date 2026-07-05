import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import auth from "../middleware/auth.js";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // ✅ Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// ✅ Base64 upload endpoint (works on Vercel)
router.post("/base64", auth, async (req, res) => {
  try {
    const { file, type } = req.body;
    
    if (!file) {
      return res.status(400).json({ message: "No file provided" });
    }

    // Extract base64 data
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: "Invalid file format" });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Determine extension
    let extension = '.jpg';
    if (mimeType.includes('png')) extension = '.png';
    else if (mimeType.includes('gif')) extension = '.gif';
    else if (mimeType.includes('pdf')) extension = '.pdf';
    else if (mimeType.includes('webp')) extension = '.webp';

    // Generate filename
    const filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + extension;
    const filePath = path.join(__dirname, '../uploads', filename);

    // ✅ Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ Save file
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    res.json({ 
      success: true,
      message: "File uploaded successfully", 
      fileUrl: fileUrl,
      filename: filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Regular upload (for local development)
router.post("/", auth, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      message: "File uploaded successfully", 
      imageUrl: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload resume (PDF)
router.post("/resume", auth, upload.single("resume"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const resumeUrl = `/uploads/${req.file.filename}`;
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