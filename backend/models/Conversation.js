/**
 * ====================================
 * CONVERSATION MODEL
 * ====================================
 * MongoDB schema for chat conversations.
 * Supports direct messages (1-on-1), groups, and communities/clubs.
 *
 * Fields:
 * - participants: Array of user references
 * - type: Type of conversation (direct, group, club)
 * - name: Group/club name (null for direct messages)
 * - description: Optional description for groups/clubs
 * - avatar: Group/club avatar URL
 * - admin: User who created the group (for groups/clubs)
 * - latestMessage: Reference to the most recent message
 * - isOfficial: Whether this is an official tutorial group
 * - createdAt/updatedAt: Timestamps
 */

const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
    {
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],
        type: {
            type: String,
            enum: ["direct", "group", "club"],
            default: "direct",
        },
        name: {
            type: String,
            trim: true,
            maxlength: [100, "Conversation name cannot exceed 100 characters"],
            // Required for groups and clubs, optional for direct messages
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, "Description cannot exceed 500 characters"],
        },
        avatar: {
            type: String,
            trim: true,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            // Required for groups and clubs
        },
        // For groups with multiple admins/moderators
        moderators: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message",
        },
        // For official tutorial groups
        isOfficial: {
            type: Boolean,
            default: false,
        },
        // For clubs - category/tags
        category: {
            type: String,
            enum: ["Academic", "Sports", "Arts", "Technology", "Social", "Other", null],
            default: null,
        },
        // Whether the group/club is public (anyone can join)
        isPublic: {
            type: Boolean,
            default: false,
        },
        // Unread count per user (stored as a Map for efficiency)
        unreadCounts: {
            type: Map,
            of: Number,
            default: new Map(),
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for finding conversations by participants
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ type: 1, updatedAt: -1 });

// Static method to find or create a direct conversation between two users
ConversationSchema.statics.findOrCreateDirect = async function (userId1, userId2) {
    // Sort IDs to ensure consistent lookup regardless of order
    const participants = [userId1, userId2].sort();

    let conversation = await this.findOne({
        type: "direct",
        participants: { $all: participants, $size: 2 },
    }).populate("participants", "username email");

    if (!conversation) {
        conversation = await this.create({
            type: "direct",
            participants: participants,
        });
        conversation = await conversation.populate("participants", "username email");
    }

    return conversation;
};

// Static method to get all conversations for a user
ConversationSchema.statics.getUserConversations = async function (userId) {
    return this.find({ participants: userId })
        .populate("participants", "username email")
        .populate("latestMessage")
        .populate("admin", "username")
        .sort({ updatedAt: -1 });
};

// Instance method to add a participant to a group
ConversationSchema.methods.addParticipant = async function (userId) {
    if (this.type === "direct") {
        throw new Error("Cannot add participants to direct conversations");
    }
    if (!this.participants.includes(userId)) {
        this.participants.push(userId);
        await this.save();
    }
    return this;
};

// Instance method to remove a participant from a group
ConversationSchema.methods.removeParticipant = async function (userId) {
    if (this.type === "direct") {
        throw new Error("Cannot remove participants from direct conversations");
    }
    this.participants = this.participants.filter(
        (p) => p.toString() !== userId.toString()
    );
    await this.save();
    return this;
};

// Virtual for member count
ConversationSchema.virtual("memberCount").get(function () {
    return this.participants.length;
});

// Ensure virtuals are included in JSON output
ConversationSchema.set("toJSON", { virtuals: true });
ConversationSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Conversation", ConversationSchema);
