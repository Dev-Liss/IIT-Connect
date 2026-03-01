const mongoose = require("mongoose");

const KuppiSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Title is required"],
        trim: true,
    },
    subject: {
        type: String,
        required: [true, "Subject is required"],
        trim: true,
    },
    date: {
        type: String, // Kept for backward compatibility or display formatting
        // No longer strictly required if dateTime is present, but let's keep it required unless we make a full migration
        required: [true, "Date is required"],
    },
    dateTime: {
        type: Date,
        required: [true, "DateTime is required for expiration logic"],
    },
    startTime: {
        type: Date,
        required: [true, "Start time is required"],
    },
    endTime: {
        type: Date,
        required: [true, "End time is required"],
        validate: {
            validator: function (value) {
                // this.startTime might be undefined validation runs before casting or if parallel
                // But usually this works.
                return this.startTime < value;
            },
            message: "End time must be after start time",
        },
    },
    // time: { type: String }, // Optional: specific display string if needed, but startTime/endTime cover it
    meetingLink: {
        type: String,
        required: [true, "Meeting link is required for online sessions"],
    },

    about: {
        type: String,
        required: false, // Made optional
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    attendees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
}, {
    timestamps: true,
});

module.exports = mongoose.model("Kuppi", KuppiSchema);
