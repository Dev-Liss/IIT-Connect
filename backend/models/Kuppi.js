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
    location: {
        type: String,
        // Location is required only if sessionMode is Physical. handled in validation or frontend usually, 
        // but for simplicity currently keeping fully required or loose. 
        // User asked: "If 'Physical' is selected... show 'Location'". 
        // Let's make it not strictly required in schema or check context. 
        // Actually, let's keep it proper:
        required: function () { return this.sessionMode === 'Physical'; }
    },
    sessionMode: {
        type: String,
        enum: ['Online', 'Physical'],
        default: 'Physical'
    },
    meetingLink: {
        type: String,
        required: function () { return this.sessionMode === 'Online'; }
    },
    maxAttendees: {
        type: Number,
        required: [true, "Max attendees is required"],
        min: [1, "At least 1 attendee required"],
    },
    about: {
        type: String,
        required: [true, "Description is required"],
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
