/**
 * ====================================
 * CLOUDINARY CONFIGURATION
 * ====================================
 * Handles image/video uploads to Cloudinary.
 * - Posts & Stories: stored in "iit-connect-posts + stories" folder
 * - Profile/Cover: stored in "iit-connect-profiles" folder
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// ── Profile / Cover image storage ─────────────────────────────
// Used by POST /api/users/profile/:id/upload-image
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "content-media/profile",
      allowed_formats: ["jpg", "jpeg", "png"],
      resource_type: "image",
    };
  },
});

const uploadProfileImage = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
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

// ====================================
// MESSAGE MEDIA UPLOAD UTILITIES
// ====================================
// Used by the messaging system for uploading chat media (images, videos, docs)

const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER || 'iit-connect-message-resources';

const uploadToCloudinary = async (file, options = {}) => {
  const uploadOptions = { folder: UPLOAD_FOLDER, resource_type: 'auto', ...options };
  try {
    if (typeof file === 'string' && file.startsWith('data:')) {
      return await cloudinary.uploader.upload(file, uploadOptions);
    } else if (Buffer.isBuffer(file)) {
      const base64 = `data:application/octet-stream;base64,${file.toString('base64')}`;
      return await cloudinary.uploader.upload(base64, uploadOptions);
    } else {
      return await cloudinary.uploader.upload(file, uploadOptions);
    }
  } catch (error) {
    throw error;
  }
};

const uploadFromBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = { folder: UPLOAD_FOLDER, resource_type: 'auto', ...options };
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    uploadStream.end(buffer);
  });
};

const uploadImageFromBuffer = (buffer, options = {}) =>
  uploadFromBuffer(buffer, { ...options, resource_type: 'image', folder: `${UPLOAD_FOLDER}/images`, transformation: [{ quality: 'auto:good' }, { fetch_format: 'auto' }] });

const uploadVideoFromBuffer = (buffer, options = {}) =>
  uploadFromBuffer(buffer, { ...options, resource_type: 'video', folder: `${UPLOAD_FOLDER}/videos`, eager: [{ quality: 'auto:good', fetch_format: 'mp4' }], eager_async: true });

const uploadDocumentFromBuffer = (buffer, options = {}) =>
  uploadFromBuffer(buffer, { ...options, resource_type: 'raw', folder: `${UPLOAD_FOLDER}/documents` });

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

const getOptimizedUrl = (publicId, options = {}) =>
  cloudinary.url(publicId, { secure: true, ...options });

module.exports = {
  // Multer-based storage (posts, stories, profiles, resources)
  cloudinary,
  upload,
  uploadProfileImage,
  resourceStorage,
  // Direct upload utilities (messaging media)
  UPLOAD_FOLDER,
  uploadToCloudinary,
  uploadFromBuffer,
  uploadImageFromBuffer,
  uploadVideoFromBuffer,
  uploadDocumentFromBuffer,
  deleteFromCloudinary,
  getOptimizedUrl,
};
