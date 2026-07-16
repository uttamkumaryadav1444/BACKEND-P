import express from "express";
import { Resend } from 'resend';

const router = express.Router();

// ✅ Debug logs
console.log('📧 RESEND_API_KEY exists?', process.env.RESEND_API_KEY ? '✅ Yes' : '❌ No');
console.log('📧 RESEND_API_KEY:', process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 10) + '...' : 'Not Set');

// ✅ Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

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

    if (!process.env.RESEND_API_KEY) {
      console.log('❌ RESEND_API_KEY not found');
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact admin."
      });
    }

    // ✅ Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Portfolio <onboarding@resend.dev>',
      to: ['uttamkumark8969@gmail.com'],
      subject: `Portfolio Contact: ${subject || 'New Message'}`,
      reply_to: email,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">📬 New Contact Form Message</h2>
          <p><strong>👤 Name:</strong> ${name}</p>
          <p><strong>📧 Email:</strong> ${email}</p>
          <p><strong>📝 Subject:</strong> ${subject || 'No Subject'}</p>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>💬 Message:</strong></p>
            <p>${message}</p>
          </div>
          <p style="color: #94a3b8; font-size: 0.9rem;">Sent from your portfolio website</p>
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

    console.log('✅ Email sent successfully!', data);
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