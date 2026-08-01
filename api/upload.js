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
  // ✅ Handle OPTIONS (Preflight)
  // ============================================================
  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    return res.status(200).end();
  }

  // ============================================================
  // ✅ GET - Test route / Resume routes
  // ============================================================
  if (req.method === 'GET') {
    const url = req.url;
    
    // ✅ Health / Test
    if (url === '/' || url === '/test') {
      console.log('✅ GET /test request received');
      return res.status(200).json({
        success: true,
        message: '✅ Upload API is working!',
        cloudinary: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing',
        },
        timestamp: new Date().toISOString()
      });
    }

    // ✅ Get Resume URL
    if (url === '/resume/url') {
      try {
        console.log('📄 Fetching resume URL...');
        
        const result = await cloudinary.search
          .expression('folder:portfolio/resumes AND resource_type:pdf')
          .sort_by('created_at', 'desc')
          .max_results(1)
          .execute();

        if (!result.resources || result.resources.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Resume not found'
          });
        }

        return res.status(200).json({
          success: true,
          resumeUrl: result.resources[0].secure_url,
          publicId: result.resources[0].public_id
        });
      } catch (error) {
        console.error('❌ Error fetching resume:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }

    // ✅ Download Resume (PDF file)
    if (url === '/resume/download' || url.startsWith('/resume/download')) {
      try {
        console.log('📥 Downloading resume...');
        
        const result = await cloudinary.search
          .expression('folder:portfolio/resumes AND resource_type:pdf')
          .sort_by('created_at', 'desc')
          .max_results(1)
          .execute();

        if (!result.resources || result.resources.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Resume not found'
          });
        }

        const resumeUrl = result.resources[0].secure_url;
        console.log('📄 Resume URL:', resumeUrl);

        // ✅ Fetch the PDF from Cloudinary
        const response = await fetch(resumeUrl);
        const buffer = await response.arrayBuffer();

        // ✅ Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="Uttam_Kumar_Resume.pdf"');
        res.setHeader('Content-Length', buffer.byteLength);
        res.setHeader('Cache-Control', 'no-cache');

        // ✅ Send the PDF
        return res.status(200).send(Buffer.from(buffer));
        
      } catch (error) {
        console.error('❌ Resume download error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Failed to download resume'
        });
      }
    }

    // ✅ View Resume (Open in browser)
    if (url === '/resume/view') {
      try {
        console.log('📄 Viewing resume...');
        
        const result = await cloudinary.search
          .expression('folder:portfolio/resumes AND resource_type:pdf')
          .sort_by('created_at', 'desc')
          .max_results(1)
          .execute();

        if (!result.resources || result.resources.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Resume not found'
          });
        }

        // ✅ Redirect to Cloudinary for viewing
        return res.redirect(result.resources[0].secure_url);
        
      } catch (error) {
        console.error('❌ Error viewing resume:', error);
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }
    }

    // ✅ Unknown GET route
    return res.status(404).json({
      success: false,
      error: 'Route not found'
    });
  }

  // ============================================================
  // ✅ POST - Upload Route
  // ============================================================
  if (req.method === 'POST') {
    try {
      console.log('📤 POST upload request received');
      
      const { file } = req.body;

      if (!file) {
        console.log('❌ No file provided');
        return res.status(400).json({
          success: false,
          error: 'No file provided.'
        });
      }

      const fileSizeInBytes = Buffer.byteLength(file, 'utf8');
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
      console.log(`📄 File size: ${fileSizeInMB.toFixed(2)} MB`);
      
      if (fileSizeInMB > 10) {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum 10MB allowed.'
        });
      }

      const isValidImage = file.startsWith('data:image/');
      const isValidPDF = file.startsWith('data:application/pdf');
      
      if (!isValidImage && !isValidPDF) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file format. Please upload an image or PDF.'
        });
      }

      console.log('📤 Uploading to Cloudinary...');

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
        publicId: result.public_id
      });

    } catch (error) {
      console.error('❌ Upload error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Upload failed.'
      });
    }
  }

  // ============================================================
  // ❌ Method Not Allowed
  // ============================================================
  return res.status(405).json({
    success: false,
    error: `Method ${req.method} not allowed.`
  });
}