import express from "express";
const router = express.Router();

// Import models
import Overview from "../models/Overview.js";
import Skill from "../models/Skill.js";
import Project from "../models/Project.js";
import Experience from "../models/Experience.js";
import NonTechSkill from "../models/NonTechSkill.js";
import Certificate from "../models/Certificate.js";
import Achievement from "../models/Achievement.js";
import Education from "../models/Education.js";
import Testimonial from "../models/Testimonial.js";

// ✅ GET all portfolio data in one request
router.get("/all", async (req, res) => {
  try {
    const [
      overview,
      skills,
      projects,
      experience,
      nonTechSkills,
      certificates,
      achievements,
      education,
      testimonials
    ] = await Promise.all([
      Overview.findOne(),
      Skill.find().sort({ order: 1 }),
      Project.find().sort({ order: 1 }),
      Experience.find().sort({ order: 1 }),
      NonTechSkill.find().sort({ order: 1 }),
      Certificate.find().sort({ order: 1 }),
      Achievement.find().sort({ order: 1 }),
      Education.find().sort({ order: 1 }),
      Testimonial.find().sort({ order: 1 })
    ]);

    res.json({
      success: true,
      data: {
        overview,
        skills,
        projects,
        experience,
        nonTechSkills,
        certificates,
        achievements,
        education,
        testimonials
      }
    });
  } catch (error) {
    console.error("❌ Error fetching portfolio data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio data: " + error.message
    });
  }
});

// ✅ Individual endpoints if needed (still under same function)
router.get("/overview", async (req, res) => {
  try {
    const overview = await Overview.findOne();
    res.json({ success: true, data: overview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/skills", async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/experience", async (req, res) => {
  try {
    const experience = await Experience.find().sort({ order: 1 });
    res.json({ success: true, data: experience });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/certificates", async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ order: 1 });
    res.json({ success: true, data: certificates });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/achievements", async (req, res) => {
  try {
    const achievements = await Achievement.find().sort({ order: 1 });
    res.json({ success: true, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/education", async (req, res) => {
  try {
    const education = await Education.find().sort({ order: 1 });
    res.json({ success: true, data: education });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/testimonials", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1 });
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/non-tech-skills", async (req, res) => {
  try {
    const nonTechSkills = await NonTechSkill.find().sort({ order: 1 });
    res.json({ success: true, data: nonTechSkills });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;