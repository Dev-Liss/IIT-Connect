/**
 * ====================================
 * MESSAGE MODEL
 * ====================================
 * MongoDB schema for chat messages.
 * Supports both direct messages and group/community messages.
 *
 * Fields:
 * - conversation: Reference to the Conversation
 * - sender: User who sent the message
 * - content: Message text content
 * - messageType: Type of message (text, image, file, system)
 * - fileUrl: URL for file/image messages
 * - fileName: Original filename for file messages
 * - readBy: Array of users who have read the message
 * - createdAt/updatedAt: Timestamps
 */

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
    {
        conversation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Conversation",
            required: [true, "Conversation reference is required"],
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Sender is required"],
        },
        content: {
            type: String,
            trim: true,
            maxlength: [5000, "Message cannot exceed 5000 characters"],
        },
        messageType: {
            type: String,
            enum: ["text", "image", "file", "system"],
            default: "text",
        },
        fileUrl: {
            type: String,
            trim: true,
        },
        fileName: {
            type: String,
            trim: true,
        },
        fileSize: {
            type: String,
            trim: true,
        },
        readBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                readAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        // For system messages (e.g., "User joined the group")
        systemMessageType: {
            type: String,
            enum: ["user_joined", "user_left", "group_created", "group_renamed", null],
            default: null,
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

// Index for efficient message retrieval by conversation
MessageSchema.index({ conversation: 1, createdAt: -1 });

// Virtual for formatting time
MessageSchema.virtual("formattedTime").get(function () {
    return this.createdAt.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
});

// Ensure virtuals are included in JSON output
MessageSchema.set("toJSON", { virtuals: true });
MessageSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Message", MessageSchema);
