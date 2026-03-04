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
// STORAGE: Posts & Stories & Reels (images/videos)
// ====================================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = "misc";

    if (req.uploadFolder === "stories") {
      folderName = "stories";
    } else if (req.uploadFolder === "posts_or_reels") {
      const mimeType = file.mimetype || "";
      if (mimeType.startsWith("video")) {
        folderName = "reels";
      } else {
        folderName = "posts";
      }
    } else if (req.uploadFolder) {
      folderName = req.uploadFolder;
    }

    const uniqueSuffix = Date.now() + "-" + file.originalname.split(".")[0];

    return {
      folder: `content-media/${folderName}`,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mov"],
      resource_type: "auto",
      public_id: uniqueSuffix,
    };
  },
});

// Create multer upload instance for posts/stories/reels
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
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "zip",
      "jpg",
      "jpeg",
      "png",
      "txt",
    ],
    resource_type: "raw",
    use_filename: true,
    unique_filename: false,
  },
});

module.exports = { cloudinary, upload, resourceStorage };
