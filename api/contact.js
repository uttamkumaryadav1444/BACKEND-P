import express from "express";
import Contact from "../models/Contact.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = new Contact({
        email: "uttam@email.com",
        phone: "+91 9876543210",
        address: "123 Main St, City",
        social: {
          github: "https://github.com/uttam",
          linkedin: "https://linkedin.com/in/uttam",
          twitter: "https://twitter.com/uttam",
          instagram: "https://instagram.com/uttam",
          facebook: "https://facebook.com/uttam"
        }
      });
      await contact.save();
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const { email, phone, address, social } = req.body;
    let contact = await Contact.findOne();
    
    if (!contact) {
      contact = new Contact({ email, phone, address, social });
    } else {
      contact.email = email || contact.email;
      contact.phone = phone || contact.phone;
      contact.address = address || contact.address;
      if (social) {
        contact.social = { ...contact.social, ...social };
      }
    }
    
    await contact.save();
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;