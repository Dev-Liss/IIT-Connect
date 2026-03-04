/**
 * ====================================
 * POST ROUTES - /api/posts
 * ====================================
 * Handles creating and fetching social feed posts.
 *
 * Endpoints:
 * - POST /api/posts                  - Create a new post with image/video upload
 * - GET  /api/posts                  - Get all posts (newest first)
 * - GET  /api/posts?mediaType=video  - Get only video posts (Reels)
 * - GET  /api/posts/:id              - Get a single post by ID
 */

const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Reel = require("../models/Reel");
const { upload, cloudinary } = require("../config/cloudinary");

// ====================================
// CREATE POST (Image or Video)
// POST /api/posts
// ====================================
// Use upload.single('media') - expects form field named 'media'
// multer-storage-cloudinary uploads directly to Cloudinary
// with resource_type: "auto" (supports images AND videos)
router.post(
  "/",
  (req, res, next) => {
    req.uploadFolder = "posts_or_reels";
    next();
  },
  upload.single("media"),
  async (req, res) => {
    // Track the Cloudinary public ID so we can clean up on failure
    let uploadedPublicId = null;

    try {
      // Validate: Ensure a file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No media file uploaded. Please attach an image or video.",
        });
      }

      console.log("📷 File received:", req.file);

      // Extract Cloudinary response data
      // multer-storage-cloudinary adds these to req.file
      const { path: cloudinaryUrl, filename: publicId } = req.file;
      uploadedPublicId = publicId;

      // Fetch the uploaded resource details from Cloudinary
      // Using resource_type: "auto" so it works for both images and videos
      let width = 1;
      let height = 1;
      let aspectRatio = 1;
      let detectedMediaType = "image"; // Default fallback

      try {
        // Try fetching as image first
        const result = await cloudinary.api.resource(publicId, {
          resource_type: "image",
        });
        width = result.width || 1;
        height = result.height || 1;
        aspectRatio = width / height;
        detectedMediaType = "image";
        console.log(
          `📐 Image dimensions: ${width}x${height}, AR: ${aspectRatio.toFixed(2)}`,
        );
      } catch (imgError) {
        // If image fetch fails, try as video
        try {
          const result = await cloudinary.api.resource(publicId, {
            resource_type: "video",
          });
          width = result.width || 1;
          height = result.height || 1;
          aspectRatio = width / height;
          detectedMediaType = "video";
          console.log(
            `🎬 Video dimensions: ${width}x${height}, AR: ${aspectRatio.toFixed(2)}`,
          );
        } catch (vidError) {
          console.log("⚠️ Could not fetch media dimensions, using defaults");
          // Fallback: guess type from file mimetype
          const mime = req.file.mimetype || "";
          detectedMediaType = mime.startsWith("video") ? "video" : "image";
        }
      }

      // Create the new post document
      let newPost;
      const postData = {
        user: req.body.userId, // Sent from frontend (will be JWT user in future)
        caption: req.body.caption || "",
        category: req.body.category || "General",
        media: {
          url: cloudinaryUrl,
          publicId: publicId,
          type: detectedMediaType,
          width: width,
          height: height,
          aspectRatio: aspectRatio,
        },
      };

      if (detectedMediaType === "video") {
        newPost = new Reel(postData);
      } else {
        newPost = new Post(postData);
      }

      // Save to MongoDB
      await newPost.save();

      // Populate user data before returning
      await newPost.populate("user", "username email studentId");

      console.log(
        `✅ ${detectedMediaType === "video" ? "🎬 Reel" : "📷 Post"} created successfully:`,
        newPost._id,
      );

      res.status(201).json({
        success: true,
        message: `${detectedMediaType === "video" ? "Reel" : "Post"} created successfully!`,
        post: newPost,
      });
    } catch (error) {
      console.error("❌ Post Upload Error:", error);

      // Cleanup: Delete the uploaded asset from Cloudinary if it exists
      if (uploadedPublicId) {
        try {
          // Try deleting as image first, then as video
          await cloudinary.uploader
            .destroy(uploadedPublicId, { resource_type: "image" })
            .catch(() =>
              cloudinary.uploader.destroy(uploadedPublicId, {
                resource_type: "video",
              }),
            );
          console.log("🧹 Cleaned up Cloudinary asset:", uploadedPublicId);
        } catch (cleanupError) {
          console.error("⚠️ Cloudinary cleanup failed:", cleanupError);
        }
      }

      res.status(500).json({
        success: false,
        message: error.message || "Failed to create post",
      });
    }
  },
);

// ====================================
// GET ALL POSTS (with optional mediaType filter)
// GET /api/posts
// GET /api/posts?mediaType=video  → returns only video posts
// ====================================
router.get("/", async (req, res) => {
  try {
    let posts = [];

    if (req.query.mediaType === "video") {
      posts = await Reel.find()
        .populate("user", "username email studentId")
        .sort({ createdAt: -1 });
    } else if (req.query.mediaType === "image") {
      posts = await Post.find()
        .populate("user", "username email studentId")
        .sort({ createdAt: -1 });
    } else {
      const [imagePosts, videoReels] = await Promise.all([
        Post.find().populate("user", "username email studentId"),
        Reel.find().populate("user", "username email studentId"),
      ]);

      posts = [...imagePosts, ...videoReels].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
    }

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
    let post = await Post.findById(req.params.id).populate(
      "user",
      "username email",
    );

    if (!post) {
      post = await Reel.findById(req.params.id).populate(
        "user",
        "username email",
      );
    }

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
// TOGGLE LIKE
// PUT /api/posts/:id/like
// ====================================
router.put("/:id/like", async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    let post = await Post.findById(req.params.id);

    if (!post) {
      post = await Reel.findById(req.params.id);
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if the user has already liked the post
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      // Unlike — remove userId from the array
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    } else {
      // Like — add userId to the array
      post.likes.push(userId);
    }

    await post.save();

    console.log(
      `${alreadyLiked ? "💔 Unliked" : "❤️ Liked"} post ${post._id} by user ${userId}`,
    );

    res.json({
      success: true,
      likes: post.likes,
      liked: !alreadyLiked,
    });
  } catch (error) {
    console.error("❌ Toggle Like Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle like",
    });
  }
});

// ====================================
// ADD COMMENT
// POST /api/posts/:id/comment
// ====================================
router.post("/:id/comment", async (req, res) => {
  try {
    const { userId, text } = req.body;

    if (!userId || !text) {
      return res.status(400).json({
        success: false,
        message: "userId and text are required",
      });
    }

    let post = await Post.findById(req.params.id);

    if (!post) {
      post = await Reel.findById(req.params.id);
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Push the new comment sub-document
    const newComment = {
      user: userId,
      text: text.trim(),
      createdAt: new Date(),
    };
    post.comments.push(newComment);
    await post.save();

    // The saved comment is the last element in the array
    const savedComment = post.comments[post.comments.length - 1];

    // Populate the user field of the newly added comment
    await post.populate({
      path: "comments.user",
      select: "username",
      match: { _id: savedComment.user },
    });

    // Find the populated comment to return
    const populatedComment = post.comments.id(savedComment._id);

    console.log(`💬 Comment added to post ${post._id} by user ${userId}`);

    res.status(201).json({
      success: true,
      comment: populatedComment,
      commentCount: post.comments.length,
    });
  } catch (error) {
    console.error("❌ Add Comment Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add comment",
    });
  }
});

// ====================================
// GET COMMENTS
// GET /api/posts/:id/comments
// ====================================
router.get("/:id/comments", async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).populate(
      "comments.user",
      "username",
    );

    if (!post) {
      post = await Reel.findById(req.params.id).populate(
        "comments.user",
        "username",
      );
    }

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Sort comments oldest to newest (chronological)
    const sortedComments = post.comments.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

    res.json({
      success: true,
      comments: sortedComments,
      commentCount: sortedComments.length,
    });
  } catch (error) {
    console.error("❌ Fetch Comments Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch comments",
    });
  }
});

module.exports = router;
