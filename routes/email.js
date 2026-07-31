import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// ✅ Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ Test email configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Email transporter error:', error);
  } else {
    console.log('✅ Email transporter ready!');
  }
});

// ✅ Send Email Route
router.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('📧 Sending email from:', email);

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required"
      });
    }

    const mailOptions = {
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: `Portfolio Contact: ${subject || 'New Message'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">📬 New Contact Form Message</h2>
          
          <div style="margin: 20px 0;">
            <p><strong style="color: #1e293b;">👤 Name:</strong> ${name}</p>
            <p><strong style="color: #1e293b;">📧 Email:</strong> <a href="mailto:${email}" style="color: #3b82f6;">${email}</a></p>
            <p><strong style="color: #1e293b;">📝 Subject:</strong> ${subject || 'No Subject'}</p>
          </div>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p style="margin: 0;"><strong>💬 Message:</strong></p>
            <p style="margin: 10px 0 0 0; white-space: pre-wrap; color: #334155;">${message}</p>
          </div>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 0.9rem;">
            <p>📤 Sent from your portfolio website</p>
            <p>🕐 ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', info.messageId);

    res.json({
      success: true,
      message: "Email sent successfully! I will get back to you soon."
    });
  } catch (error) {
    console.error("❌ Email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email: " + error.message
    });
  }
});

export default router;