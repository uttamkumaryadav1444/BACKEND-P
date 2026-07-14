import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ STEP 1: Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ STEP 2: Load .env FIRST
dotenv.config({ path: path.join(__dirname, '.env') });

// ✅ STEP 3: Debug
console.log('📧 EMAIL_USER (server):', process.env.EMAIL_USER || '❌ Not Set');
console.log('📧 EMAIL_PASS (server):', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not Set');
console.log('🔑 JWT_SECRET (server):', process.env.JWT_SECRET ? '✅ Set' : '❌ Not Set');
console.log('☁️ CLOUDINARY_CLOUD_NAME (server):', process.env.CLOUDINARY_CLOUD_NAME || '❌ Not Set');

// ✅ STEP 4: Import everything AFTER dotenv.config()
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

// ✅ Connect to MongoDB
connectDB();

const app = express();

// ✅ CORS Configuration - FIXED VERSION
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
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

// ✅ Upload route - WITHOUT /api (works with Cloudinary)
app.use("/upload", uploadRoutes);

app.use("/api/education", educationRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/testimonials", testimonialRoutes);

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running on Vercel Serverless!" });
});

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Admin: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}`);
  console.log(`✅ CORS enabled for all origins`);
});