import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
console.log('☁️ CLOUDINARY:', process.env.CLOUDINARY_CLOUD_NAME || '❌');

import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import galleryRoutes from "./routes/gallery.js";
import contactRoutes from "./routes/contact.js";
import uploadRoutes from "./routes/upload.js";
import emailRoutes from "./routes/email.js";
import portfolioRoutes from "./routes/portfolio.js"; // ✅ Combined routes

connectDB();

const app = express();

// ✅ CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.options('*', cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ OPTIMIZED ROUTES - Only 6 serverless functions now!
app.use("/api/portfolio", portfolioRoutes);  // Combined: overview, skills, projects, experience, nonTechSkills, certificates, achievements, education, testimonials
app.use("/api/auth", authRoutes);            // Authentication
app.use("/api/email", emailRoutes);          // Contact form (Nodemailer)
app.use("/api/contact", contactRoutes);      // Contact (if separate from email)
app.use("/api/gallery", galleryRoutes);      // Gallery management
app.use("/api/upload", uploadRoutes);        // File uploads (includes resume endpoints)

// ✅ Resume endpoints - Direct access
app.get("/api/resume/url", async (req, res) => {
  try {
    // Forward to upload routes
    req.url = '/upload/resume/url';
    uploadRoutes(req, res);
  } catch (error) {
    console.error('❌ Resume URL error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get("/api/resume/download", async (req, res) => {
  try {
    req.url = '/upload/resume/download';
    uploadRoutes(req, res);
  } catch (error) {
    console.error('❌ Resume download error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

app.get("/api/resume/view", async (req, res) => {
  try {
    req.url = '/upload/resume/view';
    uploadRoutes(req, res);
  } catch (error) {
    console.error('❌ Resume view error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    functions: 6 // Number of serverless functions
  });
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: err.message || "Something went wrong!" 
  });
});

// Only listen if not on Vercel
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`✅ CORS enabled for all origins`);
    console.log(`📧 Email: /api/email/send`);
    console.log(`📊 Portfolio: /api/portfolio/all`);
    console.log(`📄 Resume: /api/resume/view`);
    console.log(`📥 Resume Download: /api/resume/download`);
  });
}

// ✅ For Vercel
export default app;