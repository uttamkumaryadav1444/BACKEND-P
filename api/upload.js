import { v2 as cloudinary } from 'cloudinary';

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('☁️ Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
  api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'
});

export default async function handler(req, res) {
  // ============================================================
  // ✅ CORS Headers - Sab se pehle
  // ============================================================
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // ============================================================
  // ✅ Handle OPTIONS (Preflight) - CORS ke liye
  // ============================================================
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  // ============================================================
  // ✅ GET - Test route
  // ============================================================
  if (req.method === 'GET') {
    console.log('✅ GET request received');
    return res.status(200).json({
      success: true,
      message: '✅ Upload API is working!',
      cloudinary: {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
        api_key: process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing'
      },
      timestamp: new Date().toISOString()
    });
  }

  // ============================================================
  // ✅ POST - Main Upload Route (Sabhi uploads ke liye)
  // ============================================================
  if (req.method === 'POST') {
    try {
      console.log('📤 POST upload request received');
      
      const { file } = req.body;

      // ✅ Check if file exists
      if (!file) {
        console.log('❌ No file provided');
        return res.status(400).json({
          success: false,
          error: 'No file provided. Please send a base64 encoded file.'
        });
      }

      // ✅ Check file size (approx 5MB limit)
      const fileSizeInBytes = Buffer.byteLength(file, 'utf8');
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      console.log(`📄 File size: ${fileSizeInMB.toFixed(2)} MB`);
      
      if (fileSizeInMB > 10) {
        console.log('❌ File too large');
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum 10MB allowed.'
        });
      }

      // ✅ Check if it's a valid base64 image or PDF
      const isValidImage = file.startsWith('data:image/');
      const isValidPDF = file.startsWith('data:application/pdf');
      
      if (!isValidImage && !isValidPDF) {
        console.log('❌ Invalid file format');
        return res.status(400).json({
          success: false,
          error: 'Invalid file format. Please upload an image (JPG, PNG, GIF, WEBP) or PDF file.'
        });
      }

      console.log('📤 Uploading to Cloudinary...');

      // ✅ Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file, {
        folder: 'portfolio/uploads',
        resource_type: 'auto',
        public_id: `file_${Date.now()}`,
        access_mode: 'public'
      });

      console.log('✅ Upload successful:', result.secure_url);

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        fileUrl: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Upload failed. Please try again.'
      });
    }
  }

  // ============================================================
  // ❌ Method Not Allowed
  // ============================================================
  console.log('❌ Method not allowed:', req.method);
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} not allowed. Use GET, POST, or OPTIONS.`
  });
}