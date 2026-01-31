/**
 * ====================================
 * POST MODEL
 * ====================================
 * MongoDB schema for social feed posts.
 *
 * Fields:
 * - user: Reference to the user who created the post
 * - caption: Text content of the post
 * - category: Post category (General, Academic, Events, etc.)
 * - media: Object containing Cloudinary image/video data
 *   - url: Cloudinary URL
 *   - publicId: Cloudinary public ID (for deletion)
 *   - type: 'image' or 'video'
 *   - width/height: Original dimensions
 *   - aspectRatio: width/height (crucial for UI layout!)
 * - likes: Array of user IDs who liked the post
 */

const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
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
        enum: ["image", "video"],
        default: "image",
      },
      width: {
        type: Number,
      },
      height: {
        type: Number,
      },
      aspectRatio: {
        type: Number, // width / height - CRUCIAL for masonry/staggered grid!
      },
    },
    // Array of User ObjectIds who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  },
);

// Virtual for like count (doesn't store in DB, computed on-the-fly)
PostSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Ensure virtuals are included when converting to JSON
PostSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Post", PostSchema);
