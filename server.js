import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

// ✅ Debug environment variables
console.log('📧 RESEND_API_KEY exists?', process.env.RESEND_API_KEY ? '✅ Yes' : '❌ No');
console.log('☁️ CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Not Set');
console.log('📁 UPLOAD_DIR:', process.env.UPLOAD_DIR || '/uploads');

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import overviewRoutes from "./routes/overview.js";
import skillsRoutes from "./routes/skills.js";
import projectsRoutes from "./routes/projects.js";
import experienceRoutes from "./routes/experience.js";
import nonTechSkillsRoutes from "./routes/nonTechSkills.js";
import certificatesRoutes from "./routes/certificates.js";
import achievementsRoutes from "./routes/achievements.js";
import galleryRoutes from "./routes/gallery.js";
import contactRoutes from "./routes/contact.js";
import uploadRoutes from "./routes/upload.js";
import educationRoutes from "./routes/education.js";
import emailRoutes from "./routes/email.js";
import testimonialRoutes from "./routes/testimonials.js";

// ✅ Connect to Database
connectDB();

const app = express();

// ✅ CORS Configuration - Allow specific origins
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'https://your-frontend-domain.com' // Add your production domain here
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

app.options('*', cors());

// ✅ Body Parser Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ✅ Static Files - Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory');
}
app.use("/uploads", express.static(uploadDir));

// ✅ ROUTES - Keep all routes
app.use("/api/auth", authRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/non-tech-skills", nonTechSkillsRoutes);
app.use("/api/certificates", certificatesRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/education", educationRoutes);

// ✅ IMPORTANT: Email route - Make sure this is before any catch-all routes
app.use("/api/email", emailRoutes);

// ✅ IMPORTANT: Upload route
app.use("/api/upload", uploadRoutes); // Changed from "/upload" to "/api/upload"

// ✅ Testimonials route
app.use("/api/testimonials", testimonialRoutes);

// ✅ Health Check & Test Routes
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Backend is running!",
    env: {
      resend_key: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not Set',
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not Set'
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ✅ Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      success: false,
      message: "File too large. Maximum size is 10MB." 
    });
  }
  
  if (err.message === 'Only images and PDFs are allowed') {
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  
  res.status(500).json({ 
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ 404 Handler - Must be last
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.originalUrl} not found` 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for development origins`);
  console.log(`📧 Email API: http://localhost:${PORT}/api/email/send`);
  console.log(`📤 Upload API: http://localhost:${PORT}/api/upload`);
  console.log(`🔄 Health Check: http://localhost:${PORT}/api/health`);
});