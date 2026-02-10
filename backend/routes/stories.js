/**
 * ====================================
 * STORY ROUTES - /api/stories
 * ====================================
 * Handles ephemeral story uploads, fetching, and view tracking.
 *
 * Endpoints:
 * - POST /api/stories         - Upload a new story
 * - GET  /api/stories         - Get all active stories (last 24h), grouped by user
 * - POST /api/stories/:id/view - Mark a story as viewed
 * - GET  /api/stories/:id     - Get a single story
 *
 * GET / Response Format:
 * [
 *   {
 *     "user": { "_id": "...", "username": "...", "profilePicture": "..." },
 *     "stories": [{ "_id": "...", "mediaUrl": "...", "viewed": false, "createdAt": "..." }],
 *     "allViewed": false
 *   }
 * ]
 *
 * Sort Order: Current User → Unviewed Users → Viewed Users
 */

const express = require("express");
const router = express.Router();
const Story = require("../models/Story");
const { upload, cloudinary } = require("../config/cloudinary");

// ====================================
// CREATE STORY
// POST /api/stories
// ====================================
router.post("/", upload.single("media"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No media file uploaded. Please attach an image or video.",
      });
    }

    console.log("📖 Story file received:", req.file);

    const { path: cloudinaryUrl, filename: publicId } = req.file;
    const mimeType = req.file.mimetype || "";
    const mediaType = mimeType.startsWith("video") ? "video" : "image";

    const newStory = new Story({
      user: req.body.userId,
      mediaUrl: cloudinaryUrl,
      mediaPublicId: publicId,
      mediaType: mediaType,
      viewers: [],
    });

    await newStory.save();
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
// GET ALL ACTIVE STORIES (GROUPED BY USER)
// GET /api/stories?userId=xxx
// ====================================
// Returns stories from last 24h grouped by user.
// Sort: Current user first → Unviewed groups → Viewed groups
router.get("/", async (req, res) => {
  try {
    const currentUserId = req.query.userId;

    // 24 hours ago
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Fetch all active stories, oldest first for sequential playback
    const stories = await Story.find({
      createdAt: { $gte: twentyFourHoursAgo },
    })
      .populate("user", "username email profilePicture")
      .sort({ createdAt: 1 });

    // Group stories by user
    const groupedStoriesMap = new Map();

    stories.forEach((story) => {
      if (!story.user) return; // skip orphaned stories

      const userId = story.user._id.toString();
      const storyObj = story.toObject();

      // Calculate viewed status for current user
      storyObj.viewed = currentUserId
        ? story.viewers.some(
            (viewerId) => viewerId.toString() === currentUserId,
          )
        : false;

      // Remove viewers array from response (not needed on frontend)
      delete storyObj.viewers;

      if (!groupedStoriesMap.has(userId)) {
        groupedStoriesMap.set(userId, {
          user: story.user.toObject(),
          stories: [storyObj],
          latestStoryTime: new Date(story.createdAt).getTime(),
        });
      } else {
        const group = groupedStoriesMap.get(userId);
        group.stories.push(storyObj);
        const storyTime = new Date(story.createdAt).getTime();
        if (storyTime > group.latestStoryTime) {
          group.latestStoryTime = storyTime;
        }
      }
    });

    // Convert Map → Array, compute allViewed
    const groupedStories = Array.from(groupedStoriesMap.values()).map(
      (group) => {
        const allViewed = group.stories.every((story) => story.viewed === true);
        return {
          user: group.user,
          stories: group.stories,
          allViewed,
          _latestStoryTime: group.latestStoryTime,
          _isCurrentUser:
            currentUserId && group.user._id.toString() === currentUserId,
        };
      },
    );

    // Sort: Current user first → Unviewed → Viewed, then by recency
    groupedStories.sort((a, b) => {
      // 1. Current user always first
      if (a._isCurrentUser && !b._isCurrentUser) return -1;
      if (!a._isCurrentUser && b._isCurrentUser) return 1;

      // 2. Unviewed groups before viewed groups
      if (a.allViewed !== b.allViewed) {
        return a.allViewed ? 1 : -1;
      }

      // 3. Most recent story first within same category
      return b._latestStoryTime - a._latestStoryTime;
    });

    // Remove internal sorting fields from response
    groupedStories.forEach((group) => {
      delete group._latestStoryTime;
      delete group._isCurrentUser;
    });

    res.json({
      success: true,
      count: groupedStories.length,
      data: groupedStories,
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
router.post("/:id/view", async (req, res) => {
  try {
    const storyId = req.params.id;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required to mark story as viewed",
      });
    }

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    const alreadyViewed = story.viewers.some(
      (viewerId) => viewerId.toString() === userId,
    );

    if (!alreadyViewed) {
      await Story.findByIdAndUpdate(storyId, {
        $addToSet: { viewers: userId },
      });
      console.log(`👁️ User ${userId} viewed story ${storyId}`);
    }

    res.json({
      success: true,
      message: "Story marked as viewed",
      alreadyViewed,
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
