/**
 * ====================================
 * POST ROUTES - /api/posts
 * ====================================
 * Handles creating and fetching social feed posts.
 *
 * Endpoints:
 * - POST /api/posts      - Create a new post with image upload
 * - GET  /api/posts      - Get all posts (newest first)
 * - GET  /api/posts/:id  - Get a single post by ID
 */

const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const { upload, cloudinary } = require("../config/cloudinary");

// ====================================
// CREATE POST
// POST /api/posts
// ====================================
// Use upload.single('media') - expects form field named 'media'
router.post("/", upload.single("media"), async (req, res) => {
  try {
    // Validate: Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No media file uploaded. Please attach an image.",
      });
    }

    console.log("📷 File received:", req.file);

    // Extract Cloudinary response data
    // multer-storage-cloudinary adds these to req.file
    const { path: cloudinaryUrl, filename: publicId } = req.file;

    // Get image dimensions from Cloudinary
    // We need to fetch the uploaded resource to get width/height
    let width = 1;
    let height = 1;
    let aspectRatio = 1;

    try {
      // Fetch the uploaded image details from Cloudinary
      const result = await cloudinary.api.resource(publicId, {
        resource_type: "image",
      });
      width = result.width || 1;
      height = result.height || 1;
      aspectRatio = width / height;
      console.log(
        `📐 Image dimensions: ${width}x${height}, AR: ${aspectRatio.toFixed(2)}`,
      );
    } catch (cloudinaryError) {
      console.log("⚠️ Could not fetch image dimensions, using defaults");
      // Default to square if we can't get dimensions
    }

    // Create the new post document
    const newPost = new Post({
      user: req.body.userId, // Sent from frontend (will be JWT user in future)
      caption: req.body.caption || "",
      category: req.body.category || "General",
      media: {
        url: cloudinaryUrl,
        publicId: publicId,
        type: "image", // TODO: Detect video in future
        width: width,
        height: height,
        aspectRatio: aspectRatio,
      },
    });

    // Save to MongoDB
    await newPost.save();

    console.log("✅ Post created successfully:", newPost._id);

    res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post: newPost,
    });
  } catch (error) {
    console.error("❌ Post Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post",
    });
  }
});

// ====================================
// GET ALL POSTS
// GET /api/posts
// ====================================
router.get("/", async (req, res) => {
  try {
    // Fetch all posts
    // .populate() replaces user ObjectId with actual user data
    // .sort({ createdAt: -1 }) = newest first
    const posts = await Post.find()
      .populate("user", "username email studentId") // Only include these user fields
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error("❌ Fetch Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch posts",
    });
  }
});

// ====================================
// GET SINGLE POST
// GET /api/posts/:id
// ====================================
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate(
      "user",
      "username email",
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("❌ Fetch Single Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch post",
    });
  }
});

// ====================================
// DELETE POST
// DELETE /api/posts/:id
// ====================================
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Delete image from Cloudinary if it exists
    if (post.media?.publicId) {
      try {
        await cloudinary.uploader.destroy(post.media.publicId);
        console.log("🗑️ Cloudinary image deleted:", post.media.publicId);
      } catch (cloudinaryError) {
        console.log("⚠️ Could not delete Cloudinary image:", cloudinaryError.message);
      }
    }

    // Delete the post from MongoDB
    await Post.findByIdAndDelete(req.params.id);

    console.log("✅ Post deleted:", req.params.id);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete post",
    });
  }
});

module.exports = router;
