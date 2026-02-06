/**
 * ====================================
 * STORY ROUTES - /api/stories
 * ====================================
 * Handles ephemeral story uploads, fetching, and view tracking.
 *
 * Endpoints:
 * - POST /api/stories         - Upload a new story
 * - GET  /api/stories         - Get all active stories (last 24h)
 * - POST /api/stories/:id/view - Mark a story as viewed
 */

const express = require("express");
const router = express.Router();
const Story = require("../models/Story");
const { upload, cloudinary } = require("../config/cloudinary");

// ====================================
// CREATE STORY
// POST /api/stories
// ====================================
// Use upload.single('media') - expects form field named 'media'
router.post("/", upload.single("media"), async (req, res) => {
  try {
    // Validate: Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No media file uploaded. Please attach an image or video.",
      });
    }

    console.log("📖 Story file received:", req.file);

    // Extract Cloudinary response data
    const { path: cloudinaryUrl, filename: publicId } = req.file;

    // Determine media type (image or video)
    const mimeType = req.file.mimetype || "";
    const mediaType = mimeType.startsWith("video") ? "video" : "image";

    // Create the new story document
    const newStory = new Story({
      user: req.body.userId, // Sent from frontend (or could use JWT user)
      mediaUrl: cloudinaryUrl,
      mediaPublicId: publicId,
      mediaType: mediaType,
      viewers: [], // No viewers initially
    });

    // Save to MongoDB
    await newStory.save();

    // Populate user data for response
    await newStory.populate("user", "username email profilePicture");

    console.log("✅ Story created successfully:", newStory._id);

    res.status(201).json({
      success: true,
      message: "Story uploaded successfully!",
      story: newStory,
    });
  } catch (error) {
    console.error("❌ Story Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload story",
    });
  }
});

// ====================================
// GET ALL ACTIVE STORIES
// GET /api/stories
// ====================================
// Returns all stories from the last 24 hours, grouped by user
// Query param: ?userId=xxx to calculate 'viewed' status
router.get("/", async (req, res) => {
  try {
    const currentUserId = req.query.userId; // Current user's ID for viewed calculation

    // Calculate 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch all stories created in the last 24 hours
    const stories = await Story.find({
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .populate("user", "username email profilePicture")
      .sort({ createdAt: -1 }); // Newest first

    // Transform stories to include 'viewed' boolean for current user
    const storiesWithViewStatus = stories.map((story) => {
      const storyObj = story.toObject();

      // Check if current user has viewed this story
      storyObj.viewed = currentUserId
        ? story.viewers.some(
            (viewerId) => viewerId.toString() === currentUserId,
          )
        : false;

      return storyObj;
    });

    res.json({
      success: true,
      count: storiesWithViewStatus.length,
      data: storiesWithViewStatus,
    });
  } catch (error) {
    console.error("❌ Fetch Stories Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch stories",
    });
  }
});

// ====================================
// MARK STORY AS VIEWED
// POST /api/stories/:id/view
// ====================================
// Adds current user's ID to the viewers array
router.post("/:id/view", async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.body.userId; // User who is viewing

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to mark story as viewed",
      });
    }

    // Find the story
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    // Check if user has already viewed (avoid duplicates)
    const alreadyViewed = story.viewers.some(
      (viewerId) => viewerId.toString() === userId,
    );

    if (!alreadyViewed) {
      // Add user to viewers array using $addToSet (prevents duplicates)
      await Story.findByIdAndUpdate(storyId, {
        $addToSet: { viewers: userId },
      });
      console.log(`👁️ User ${userId} viewed story ${storyId}`);
    }

    res.json({
      success: true,
      message: "Story marked as viewed",
      alreadyViewed: alreadyViewed,
    });
  } catch (error) {
    console.error("❌ Mark Story Viewed Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark story as viewed",
    });
  }
});

// ====================================
// GET SINGLE STORY
// GET /api/stories/:id
// ====================================
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "user",
      "username email profilePicture",
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found or expired",
      });
    }

    res.json({
      success: true,
      data: story,
    });
  } catch (error) {
    console.error("❌ Fetch Single Story Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch story",
    });
  }
});

module.exports = router;
