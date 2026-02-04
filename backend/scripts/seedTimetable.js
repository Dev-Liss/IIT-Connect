/**
 * ====================================
 * SEED SCRIPT: TIMETABLE
 * ====================================
 * Populates the database with sample timetable data for CS-2A.
 * Run with: node backend/scripts/seedTimetable.js
 */

require("dotenv").config({ path: "./backend/.env" }); // Adjust path if running from root
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const TimetableEntry = require("../models/timetableEntry");

const sampleData = [
    {
        courseCode: "CS101",
        courseName: "Intro to Computer Science",
        tutGroup: "CS-2A",
        day: "Mon",
        startTime: "09:00",
        endTime: "11:00",
        location: "Room 203",
        sessionType: "Lecture",
        color: "#E3F2FD", // Light Blue
    },
    {
        courseCode: "CS103",
        courseName: "Data Structures",
        tutGroup: "CS-2A",
        day: "Tue",
        startTime: "09:00",
        endTime: "11:00",
        location: "Hall C",
        sessionType: "Lecture",
        color: "#F8BBD0", // Light Pink
    },
    {
        courseCode: "ENG201",
        courseName: "English Communication",
        tutGroup: "CS-2A",
        day: "Tue",
        startTime: "13:00",
        endTime: "15:00",
        location: "Online",
        sessionType: "Lecture",
        color: "#F8BBD0", // Light Pink
    },
    {
        courseCode: "CS104",
        courseName: "Database Systems",
        tutGroup: "CS-2A",
        day: "Tue",
        startTime: "17:00",
        endTime: "19:00",
        location: "Computer Lab 3",
        sessionType: "Lab",
        color: "#FFF9C4", // Light Yellow
    },
    {
        courseCode: "MATH201",
        courseName: "Mathematics II",
        tutGroup: "CS-2A",
        day: "Wed",
        startTime: "10:00",
        endTime: "12:00",
        location: "Room 305",
        sessionType: "Lecture",
        color: "#E3F2FD", // Light Blue
    },
    {
        courseCode: "CS102",
        courseName: "Programming II",
        tutGroup: "CS-2A",
        day: "Thu",
        startTime: "13:00",
        endTime: "15:00",
        location: "Lab 2B",
        sessionType: "Lab",
        color: "#FFF9C4", // Light Yellow
    },
    {
        courseCode: "CS105",
        courseName: "Web Development",
        tutGroup: "CS-2A",
        day: "Fri",
        startTime: "09:00",
        endTime: "11:00",
        location: "Hall A",
        sessionType: "Lecture",
        color: "#E3F2FD", // Light Blue
    },
];

const seedData = async () => {
    try {
        // 1. Connect to DB
        await connectDB();
        console.log("✅ Connected to MongoDB");

        // 2. Clear existing entries for this group
        await TimetableEntry.deleteMany({ tutGroup: "CS-2A" });
        console.log("🗑️ Cleared existing CS-2A entries");

        // 3. Insert new data
        await TimetableEntry.insertMany(sampleData);
        console.log("✅ Seeded sample timetable data");

        // 4. Exit
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedData();
