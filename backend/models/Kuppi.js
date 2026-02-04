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
        type: String, // Storing as string for simplicity as per UI (e.g. "Friday, 10:00 AM") or ISO date string
        required: [true, "Date is required"],
    },
    time: {
        type: String,
        required: [true, "Time is required"],
    },
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
