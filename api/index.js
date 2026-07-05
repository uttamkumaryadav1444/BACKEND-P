// ✅ Serverless function for Vercel
// Ye file Vercel par backend API ke liye entry point hai

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ✅ Get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// ✅ Debug logs
console.log('📧 EMAIL_USER (serverless):', process.env.EMAIL_USER || '❌ Not Set');
console.log('📧 EMAIL_PASS (serverless):', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not Set');
console.log('🔑 JWT_SECRET (serverless):', process.env.JWT_SECRET ? '✅ Set' : '❌ Not Set');

// ✅ Import everything
import authRoutes from "../routes/auth.js";
import overviewRoutes from "../routes/overview.js";
import skillsRoutes from "../routes/skills.js";
import projectsRoutes from "../routes/projects.js";
import experienceRoutes from "../routes/experience.js";
import nonTechSkillsRoutes from "../routes/nonTechSkills.js";
import certificatesRoutes from "../routes/certificates.js";
import achievementsRoutes from "../routes/achievements.js";
import galleryRoutes from "../routes/gallery.js";
import contactRoutes from "../routes/contact.js";
import uploadRoutes from "../routes/upload.js";
import educationRoutes from "../routes/education.js";
import emailRoutes from "../routes/email.js";
import testimonialRoutes from "../routes/testimonials.js";

// ✅ Database connection with serverless optimization
import mongoose from "mongoose";

// ✅ Global cache for database connection (Serverless optimization)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // ✅ If connection exists, reuse it
  if (cached.conn) {
    console.log('✅ Using cached database connection');
    return cached.conn;
  }

  // ✅ If connection is in progress, wait for it
  if (!cached.promise) {
    console.log('🔄 Creating new database connection...');
    
    // ✅ Connection options for serverless
    const opts = {
      bufferCommands: true,  // ✅ Set to true to avoid connection issues
      maxPoolSize: 5,
      minPoolSize: 1,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(process.env.MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB Connected (Serverless)');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    throw error;
  }

  return cached.conn;
};

const app = express();

// ✅ CORS Configuration - Allow all Vercel frontend
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://frontend-blush-omega-4wocwqn4e9.vercel.app',
  'https://frontend-*.vercel.app',
  'https://*.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.match(allowed.replace(/\*/g, '.*')))) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin (serverless):', origin);
      callback(null, true); // Allow all for now (remove in production)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
  res.json({ message: "Backend is running on Vercel Serverless!" });
});

// ✅ Health check for Vercel
app.get("/api/health", async (req, res) => {
  try {
    await connectDB();
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
});

// ✅ Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.stack);
  res.status(500).json({ 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// ✅ Export for Vercel serverless
export default async (req, res) => {
  // ✅ Connect to database before handling request
  try {
    await connectDB();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't block request if DB connection fails
    // Just log and proceed - API might still work for some endpoints
  }
  
  // ✅ Handle the request with Express
  return app(req, res);
};