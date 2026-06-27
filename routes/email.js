import express from "express";
import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Force load .env in this file too
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const router = express.Router();

// ✅ Debug: Check if API key is loading
console.log('🔑 RESEND_API_KEY in email.js:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not Set');

// ✅ Initialize Resend with API key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.log('❌ RESEND_API_KEY not found!');
  console.log('📧 Please check your .env file');
}

const resend = new Resend(apiKey);

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

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact admin."
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['uttamkumark8969@gmail.com'],
      subject: `Uttam Kumar Yadav Portfolio Contact: ${subject || 'New Message'}`,
      reply_to: email,
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
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(400).json({ 
        success: false, 
        message: error.message 
      });
    }

    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', data?.id);

    res.json({ 
      success: true, 
      message: "Email sent successfully!" 
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