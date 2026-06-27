import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ STEP 1: Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ STEP 2: Load .env FIRST (before any other imports)
dotenv.config({ path: path.join(__dirname, '.env') });

// ✅ STEP 3: Debug - Check if env loaded
console.log('📧 EMAIL_USER (server):', process.env.EMAIL_USER || '❌ Not Set');
console.log('📧 EMAIL_PASS (server):', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not Set');

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

// ✅ CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.use("/api/upload", uploadRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/testimonials", testimonialRoutes);

// ✅ Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is running!" });
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Admin: ${process.env.ADMIN_USERNAME} / ${process.env.ADMIN_PASSWORD}`);
});