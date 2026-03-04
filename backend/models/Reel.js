/**
 * ====================================
 * REEL MODEL
 * ====================================
 * MongoDB schema for social feed reels (videos).
 *
 * Fields:
 * - user: Reference to the user who created the reel
 * - caption: Text content of the reel
 * - category: Category (General, Academic, Events, etc.)
 * - media: Object containing Cloudinary video data
 *   - url: Cloudinary URL
 *   - publicId: Cloudinary public ID (for deletion)
 *   - type: 'video' (always video for Reels)
 *   - width/height: Original dimensions
 *   - aspectRatio: width/height
 * - likes: Array of user IDs who liked the reel
 * - comments: Array of comment sub-documents
 */

const mongoose = require("mongoose");

const ReelSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, "Caption cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: ["General", "Academic", "Events", "Sports", "Clubs", "Memes"],
      default: "General",
    },
    // Media object - stores Cloudinary data
    media: {
      url: {
        type: String,
        required: [true, "Media URL is required"],
      },
      publicId: {
        type: String, // Used for deleting from Cloudinary later
      },
      type: {
        type: String,
        enum: ["video"],
        default: "video",
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
      aspectRatio: {
        type: Number,
      },
    },
    // Array of User ObjectIds who liked this reel
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Array of comment sub-documents
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
          maxlength: [500, "Comment cannot exceed 500 characters"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  },
);

// Virtual for like count
ReelSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for comment count
ReelSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Ensure virtuals are included when converting to JSON
ReelSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Reel", ReelSchema);
