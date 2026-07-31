import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Login Route - No auto-creation!
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log("📝 Login attempt for:", username);

    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Username and password are required" 
      });
    }

    // Find user - ONLY find, don't create!
    const user = await User.findOne({ username });

    if (!user) {
      console.log("❌ User not found:", username);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log("❌ Invalid password for:", username);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username,
        email: user.email 
      },
      process.env.JWT_SECRET || "your_secret_key_here",
      { expiresIn: "7d" }
    );

    console.log("✅ Login successful for:", username);

    res.json({ 
      success: true,
      token,
      admin: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error("❌ Server error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
});

// Verify Token Route
router.get("/verify", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        valid: false, 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key_here");
    res.json({ 
      success: true,
      valid: true, 
      user: decoded 
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      valid: false, 
      message: "Invalid or expired token" 
    });
  }
});

export default router;