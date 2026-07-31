import express from "express";
const router = express.Router();

// Import all portfolio-related routes
import overviewRoutes from "../routes/overview.js";
import skillsRoutes from "../routes/skills.js";
import projectsRoutes from "../routes/projects.js";
import experienceRoutes from "../routes/experience.js";
import nonTechSkillsRoutes from "../routes/nonTechSkills.js";
import certificatesRoutes from "../routes/certificates.js";
import achievementsRoutes from "../routes/achievements.js";
import educationRoutes from "../routes/education.js";
import testimonialsRoutes from "../routes/testimonials.js";

// Mount all under /api/portfolio
router.use("/overview", overviewRoutes);
router.use("/skills", skillsRoutes);
router.use("/projects", projectsRoutes);
router.use("/experience", experienceRoutes);
router.use("/non-tech-skills", nonTechSkillsRoutes);
router.use("/certificates", certificatesRoutes);
router.use("/achievements", achievementsRoutes);
router.use("/education", educationRoutes);
router.use("/testimonials", testimonialsRoutes);

export default router;