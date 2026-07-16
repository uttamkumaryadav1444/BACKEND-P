import express from "express";
import { Resend } from 'resend';

const router = express.Router();

// ✅ Get API Key from environment
const API_KEY = process.env.RESEND_API_KEY;
console.log('📧 API Key Status:', API_KEY ? '✅ Found' : '❌ Missing');
console.log('📧 API Key:', API_KEY ? API_KEY.substring(0, 10) + '...' : 'Not Set');

// ✅ Initialize Resend with new key
const resend = new Resend(API_KEY);

// ✅ Test Route - Check if API Key is loading
router.get("/test", (req, res) => {
  res.json({
    success: true,
    apiKeyExists: !!API_KEY,
    apiKeyLength: API_KEY?.length || 0,
    apiKeyPrefix: API_KEY?.substring(0, 10) || 'None'
  });
});

router.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('📨 Received:', { name, email, subject });

    // ✅ Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required"
      });
    }

    // ✅ Check API Key
    if (!API_KEY) {
      return res.status(500).json({
        success: false,
        message: "RESEND_API_KEY not configured"
      });
    }

    console.log('📤 Sending email...');

    // ✅ Send Email with new key
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['uttamkumark8969@gmail.com'],
      subject: `Portfolio Contact: ${subject || 'New Message'}`,
      reply_to: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px;">
          <h2 style="color: #3b82f6;">📬 New Contact Form Message</h2>
          <p><strong>👤 Name:</strong> ${name}</p>
          <p><strong>📧 Email:</strong> ${email}</p>
          <p><strong>📝 Subject:</strong> ${subject || 'No Subject'}</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>💬 Message:</strong></p>
            <p>${message}</p>
          </div>
          <p style="color: #6b7280; font-size: 0.9rem;">Sent from portfolio website</p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    console.log('✅ Email sent:', data);
    res.json({
      success: true,
      message: "Email sent successfully!"
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send email"
    });
  }
});

export default router;