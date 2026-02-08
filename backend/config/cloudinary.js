/**
 * ====================================
 * CLOUDINARY CONFIGURATION
 * ====================================
 * Handles image/video uploads to Cloudinary.
 * Files are stored in the "iit-connect-posts" folder.
 *
 * TEAM: Make sure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * and CLOUDINARY_API_SECRET are set in backend/.env
 */

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
require("dotenv").config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Storage for Cloudinary
// This automatically uploads files to Cloudinary when received
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "iit-connect-posts + stories",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mov"],
      // Request Cloudinary to return image dimensions
      // This is CRUCIAL for aspect ratio calculation!
      resource_type: "auto", // Automatically detect image/video
    };
  },
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

module.exports = { cloudinary, upload };
