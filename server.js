import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing');
console.log('☁️ CLOUDINARY:', process.env.CLOUDINARY_CLOUD_NAME || '❌');

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

// ✅ ROUTES - YAHAN CHANGE KARO
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
app.use("/api/email", emailRoutes);
app.use("/api/testimonials", testimonialRoutes);
app.use("/api", uploadRoutes);  // ✅ CHANGE: /api/upload se /api karo

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for all origins`);
  console.log(`📧 Email: /api/email/send`);
});

// ✅ YEH ADD KARO - VERCEL KE LIYE
export default app;