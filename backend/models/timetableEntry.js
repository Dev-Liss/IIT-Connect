/**
 * ====================================
 * TIMETABLE ENTRY MODEL
 * ====================================
 * MongoDB schema for timetable classes.
 */

const mongoose = require("mongoose");

const TimetableEntrySchema = new mongoose.Schema(
    {
        courseCode: {
            type: String,
            required: [true, "Course code is required"], // e.g., "CS101"
            trim: true,
        },
        courseName: {
            type: String,
            trim: true, // e.g., "Object Oriented Programming"
        },
        tutGroup: {
            type: String,
            required: [true, "Tutorial group is required"], // e.g., "CS-2A"
            trim: true,
        },
        day: {
            type: String,
            enum: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            required: [true, "Day is required"],
        },
        startTime: {
            type: String,
            required: [true, "Start time is required"], // format: "09:00"
        },
        endTime: {
            type: String,
            required: [true, "End time is required"], // format: "11:00"
        },
        location: {
            type: String,
            required: [true, "Location is required"], // e.g., "Room 203"
        },
        sessionType: {
            type: String,
            enum: ["Lecture", "Tutorial", "Lab"],
            default: "Lecture",
        },
        color: {
            type: String, // Hex color for UI card background
        },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model("TimetableEntry", TimetableEntrySchema);
