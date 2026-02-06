/**
 * ====================================
 * STORY MODEL
 * ====================================
 * MongoDB schema for ephemeral stories (24-hour auto-delete).
 *
 * Fields:
 * - user: Reference to the user who created the story
 * - mediaUrl: Cloudinary URL of the story media
 * - mediaType: 'image' or 'video'
 * - viewers: Array of user IDs who have viewed the story
 * - createdAt: Timestamp with TTL index for auto-deletion
 *
 * Auto-Deletion:
 * - Stories automatically expire after 24 hours (86400 seconds)
 * - MongoDB's TTL index handles cleanup automatically
 */

const mongoose = require("mongoose");

const StorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  mediaUrl: {
    type: String,
    required: [true, "Media URL is required"],
  },
  mediaPublicId: {
    type: String, // Cloudinary public ID for future deletion if needed
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    default: "image",
  },
  // Array of User ObjectIds who have viewed this story
  viewers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // createdAt with TTL index - stories auto-delete after 24 hours
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // 24 hours in seconds (TTL index)
  },
});

// Virtual for viewer count
StorySchema.virtual("viewerCount").get(function () {
  return this.viewers.length;
});

// Ensure virtuals are included when converting to JSON
StorySchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Story", StorySchema);
