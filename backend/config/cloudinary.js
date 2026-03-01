/**
 * ====================================
 * CLOUDINARY CONFIGURATION
 * ====================================
 * Handles image/video uploads to Cloudinary.
 * - Posts & Stories: stored in "iit-connect-posts + stories" folder
 * - Academic Resources: stored in "IIT-Connect-Resources" folder
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

// ====================================
// STORAGE: Posts & Stories (images/videos)
// ====================================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "iit-connect-posts + stories",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mov"],
      resource_type: "auto",
    };
  },
});

// Create multer upload instance for posts/stories
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

// ====================================
// STORAGE: Academic Resources (documents)
// ====================================
const resourceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "IIT-Connect-Resources",
    allowed_formats: [
      "pdf", "doc", "docx", "ppt", "pptx", "zip",
      "jpg", "jpeg", "png", "txt",
    ],
    resource_type: "raw",
    use_filename: true,
    unique_filename: false,
  },
});

module.exports = { cloudinary, upload, resourceStorage };
