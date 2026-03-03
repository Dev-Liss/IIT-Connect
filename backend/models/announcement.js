/**
 * ====================================
 * ANNOUNCEMENT MODEL
 * ====================================
 * MongoDB schema for campus announcements.
 */

const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Announcement title is required"],
            trim: true,
        },
        content: {
            type: String,
            required: [true, "Announcement content is required"],
        },
        source: {
            type: String,
            required: [true, "Source/department is required"],
            trim: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
