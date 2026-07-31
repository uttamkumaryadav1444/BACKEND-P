import express from "express";
import Overview from "../models/Overview.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let overview = await Overview.findOne();
    if (!overview) {
      overview = new Overview({
        name: "Uttam",
        title: "Full Stack Developer",
        bio: "Passionate developer building amazing digital experiences",
        tagline: "Crafting Digital Experiences"
      });
      await overview.save();
    }
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const { name, title, bio, tagline, profileImage, resumeUrl } = req.body;
    let overview = await Overview.findOne();
    
    if (!overview) {
      overview = new Overview({ name, title, bio, tagline, profileImage, resumeUrl });
    } else {
      overview.name = name || overview.name;
      overview.title = title || overview.title;
      overview.bio = bio || overview.bio;
      overview.tagline = tagline || overview.tagline;
      overview.profileImage = profileImage || overview.profileImage;
      overview.resumeUrl = resumeUrl || overview.resumeUrl;
    }
    
    await overview.save();
    res.json(overview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;