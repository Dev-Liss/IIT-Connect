/**
 * ====================================
 * CLOUDINARY CONFIGURATION
 * ====================================
 * Handles image/video uploads to Cloudinary.
 * - Posts        -> "iit-connect-posts" folder
 * - Profile/Cover -> "iit-connect-profiles" folder
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

// ── Posts storage (existing) ──────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "iit-connect-posts",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mov"],
      resource_type: "auto",
    };
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Profile / Cover image storage ─────────────────────────────
// Used by POST /api/users/profile/:id/upload-image
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "iit-connect-profiles",
      allowed_formats: ["jpg", "jpeg", "png"],
      resource_type: "image",
    };
  },
});

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { cloudinary, upload, uploadProfileImage };
