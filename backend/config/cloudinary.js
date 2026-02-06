const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'IIT-Connect-Resources',
        allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'], // Restrict file types
        resource_type: 'raw' // 'raw' is often needed for non-image files like PDFs/Docs in some contexts, or 'auto'
    }
});

module.exports = {
    cloudinary,
    storage
};
