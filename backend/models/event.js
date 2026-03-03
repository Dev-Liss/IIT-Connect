/**
 * ====================================
 * EVENT MODEL
 * ====================================
 * MongoDB schema for university events.
 */

const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Event title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Event description is required"],
        },
        category: {
            type: String,
            enum: ["academic", "career", "workshop", "sports", "other"],
            default: "other",
        },
        eventDate: {
            type: Date,
            required: [true, "Event date is required"],
        },
        startTime: {
            type: String,
            required: [true, "Start time is required"],
        },
        endTime: {
            type: String,
            required: [true, "End time is required"],
        },
        location: {
            type: String,
            required: [true, "Location is required"],
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        isPublished: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Event", EventSchema);
