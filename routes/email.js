import express from "express";
import { Resend } from 'resend';

const router = express.Router();

// ✅ API Key check
const RESEND_API_KEY = process.env.RESEND_API_KEY;
console.log('📧 Resend API Key:', RESEND_API_KEY ? '✅ Found' : '❌ Not found');

// ✅ Initialize Resend with new key
const resend = new Resend(RESEND_API_KEY);

router.post("/send", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    console.log('📧 Received:', { name, email, subject, message: message?.substring(0, 20) });

    // ✅ Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required"
      });
    }

    // ✅ Check API Key
    if (!RESEND_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "Email service not configured"
      });
    }

    // ✅ Send Email
    const { data, error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['uttamkumark8969@gmail.com'],
      subject: `Portfolio Contact: ${subject || 'New Message'}`,
      reply_to: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #3b82f6;">📬 New Contact Form Message</h2>
          <p><strong>👤 Name:</strong> ${name}</p>
          <p><strong>📧 Email:</strong> ${email}</p>
          <p><strong>📝 Subject:</strong> ${subject || 'No Subject'}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>💬 Message:</strong></p>
            <p>${message}</p>
          </div>
          <p style="color: #94a3b8; font-size: 0.9rem;">Sent from portfolio website</p>
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

    console.log('✅ Email sent!', data);
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