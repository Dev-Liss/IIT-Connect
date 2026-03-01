/**
 * ====================================
 * SEED SCRIPT: TIMETABLE
 * ====================================
 * Populates the database with full weekly schedules for tutorial groups:
 * - CS-2A
 * - CS-2B
 * - CS-2C
 * 
 * Run with: node backend/scripts/seedTimetable.js
 */

const path = require("path");
// Robust .env loading: works regardless of where the script is run from
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const TimetableEntry = require("../models/timetableEntry");

const COLORS = {
    BLUE: "#E3F2FD",
    PINK: "#F8BBD0",
    YELLOW: "#FFF9C4",
    PURPLE: "#E1BEE7",
    GREEN: "#C8E6C9"
};

const timetableData = [
    // ====================================
    // GROUP: CS-2A
    // ====================================
    // Monday
    {
        courseCode: "CS101",
        courseName: "Intro to Programming",
        tutGroup: "CS-2A",
        day: "Mon",
        startTime: "09:00",
        endTime: "11:00",
        location: "Room 203",
        sessionType: "Lecture",
        color: COLORS.BLUE
    },
    {
        courseCode: "CS102",
        courseName: "Database Systems",
        tutGroup: "CS-2A",
        day: "Mon",
        startTime: "13:00",
        endTime: "15:00",
        location: "Hall A",
        sessionType: "Tutorial",
        color: COLORS.PINK
    },

    // Tuesday
    {
        courseCode: "MATH201",
        courseName: "Discrete Mathematics",
        tutGroup: "CS-2A",
        day: "Tue",
        startTime: "10:00",
        endTime: "12:00",
        location: "Room 305",
        sessionType: "Lecture",
        color: COLORS.YELLOW
    },
    {
        courseCode: "CS103",
        courseName: "Algorithms Lab",
        tutGroup: "CS-2A",
        day: "Tue",
        startTime: "14:00",
        endTime: "16:00",
        location: "Lab 2B",
        sessionType: "Lab",
        color: COLORS.PURPLE
    },

    // Wednesday
    {
        courseCode: "ENG201",
        courseName: "Technical Writing",
        tutGroup: "CS-2A",
        day: "Wed",
        startTime: "09:00",
        endTime: "10:30",
        location: "Room 401",
        sessionType: "Lecture",
        color: COLORS.GREEN
    },
    {
        courseCode: "CS104",
        courseName: "Web Development",
        tutGroup: "CS-2A",
        day: "Wed",
        startTime: "11:00",
        endTime: "13:00",
        location: "Computer Lab 1",
        sessionType: "Lab",
        color: COLORS.BLUE
    },
    {
        courseCode: "CS105",
        courseName: "Data Structures",
        tutGroup: "CS-2A",
        day: "Wed",
        startTime: "15:00",
        endTime: "17:00",
        location: "Hall B",
        sessionType: "Lecture",
        color: COLORS.PINK
    },

    // Thursday
    {
        courseCode: "CS102",
        courseName: "Database Systems",
        tutGroup: "CS-2A",
        day: "Thu",
        startTime: "10:00",
        endTime: "11:30",
        location: "Hall B",
        sessionType: "Lecture",
        color: COLORS.PINK
    },
    {
        courseCode: "CS103",
        courseName: "Algorithms Lab",
        tutGroup: "CS-2A",
        day: "Thu",
        startTime: "13:00",
        endTime: "15:00",
        location: "Lab 4",
        sessionType: "Lab",
        color: COLORS.PURPLE
    },

    // Friday
    {
        courseCode: "CS104",
        courseName: "Web Development",
        tutGroup: "CS-2A",
        day: "Fri",
        startTime: "09:00",
        endTime: "11:00",
        location: "Computer Lab 1",
        sessionType: "Tutorial",
        color: COLORS.BLUE
    },
    {
        courseCode: "MATH201",
        courseName: "Discrete Mathematics",
        tutGroup: "CS-2A",
        day: "Fri",
        startTime: "14:00",
        endTime: "16:00",
        location: "Room 203",
        sessionType: "Tutorial",
        color: COLORS.YELLOW
    },

    // ====================================
    // GROUP: CS-2B
    // ====================================
    // Monday
    {
        courseCode: "MATH201",
        courseName: "Discrete Mathematics",
        tutGroup: "CS-2B",
        day: "Mon",
        startTime: "09:00",
        endTime: "11:00",
        location: "Hall C",
        sessionType: "Lecture",
        color: COLORS.YELLOW
    },
    {
        courseCode: "CS104",
        courseName: "Web Development",
        tutGroup: "CS-2B",
        day: "Mon",
        startTime: "13:00",
        endTime: "15:00",
        location: "Computer Lab 1",
        sessionType: "Lab",
        color: COLORS.BLUE
    },

    // Tuesday
    {
        courseCode: "CS101",
        courseName: "Intro to Programming",
        tutGroup: "CS-2B",
        day: "Tue",
        startTime: "11:00",
        endTime: "13:00",
        location: "Hall A",
        sessionType: "Lecture",
        color: COLORS.BLUE
    },
    {
        courseCode: "ENG201",
        courseName: "Technical Writing",
        tutGroup: "CS-2B",
        day: "Tue",
        startTime: "14:00",
        endTime: "15:30",
        location: "Room 305",
        sessionType: "Lecture",
        color: COLORS.GREEN
    },

    // Wednesday
    {
        courseCode: "CS102",
        courseName: "Database Systems",
        tutGroup: "CS-2B",
        day: "Wed",
        startTime: "08:00",
        endTime: "10:00",
        location: "Hall B",
        sessionType: "Lecture",
        color: COLORS.PINK
    },
    {
        courseCode: "CS103",
        courseName: "Algorithms Lab",
        tutGroup: "CS-2B",
        day: "Wed",
        startTime: "10:30",
        endTime: "12:30",
        location: "Lab 2B",
        sessionType: "Lab",
        color: COLORS.PURPLE
    },
    {
        courseCode: "CS105",
        courseName: "Data Structures",
        tutGroup: "CS-2B",
        day: "Wed",
        startTime: "14:00",
        endTime: "16:00",
        location: "Room 401",
        sessionType: "Tutorial",
        color: COLORS.PINK
    },

    // Thursday
    {
        courseCode: "CS104",
        courseName: "Web Development",
        tutGroup: "CS-2B",
        day: "Thu",
        startTime: "09:00",
        endTime: "11:00",
        location: "Lecture Hall B",
        sessionType: "Tutorial",
        color: COLORS.BLUE
    },
    {
        courseCode: "MATH201",
        courseName: "Discrete Mathematics",
        tutGroup: "CS-2B",
        day: "Thu",
        startTime: "12:00",
        endTime: "14:00",
        location: "Room 203",
        sessionType: "Tutorial",
        color: COLORS.YELLOW
    },

    // Friday
    {
        courseCode: "CS105",
        courseName: "Data Structures",
        tutGroup: "CS-2B",
        day: "Fri",
        startTime: "10:00",
        endTime: "12:00",
        location: "Hall A",
        sessionType: "Lecture",
        color: COLORS.PINK
    },
    {
        courseCode: "CS102",
        courseName: "Database Systems",
        tutGroup: "CS-2B",
        day: "Fri",
        startTime: "15:00",
        endTime: "17:00",
        location: "Lab 3",
        sessionType: "Lab",
        color: COLORS.PINK
    },


    // ====================================
    // GROUP: CS-2C
    // ====================================
    // Monday
    {
        courseCode: "CS103",
        courseName: "Algorithms Lab",
        tutGroup: "CS-2C",
        day: "Mon",
        startTime: "10:00",
        endTime: "12:00",
        location: "Lab 3",
        sessionType: "Lab",
        color: COLORS.PURPLE
    },
    {
        courseCode: "CS105",
        courseName: "Data Structures",
        tutGroup: "CS-2C",
        day: "Mon",
        startTime: "14:00",
        endTime: "16:00",
        location: "Room 203",
        sessionType: "Lecture",
        color: COLORS.PINK
    },

    // Tuesday
    {
        courseCode: "CS104",
        courseName: "Web Development",
        tutGroup: "CS-2C",
        day: "Tue",
        startTime: "08:00",
        endTime: "10:00",
        location: "Computer Lab 1",
        sessionType: "Lab",
        color: COLORS.BLUE
    },
    {
        courseCode: "CS102",
        courseName: "Database Systems",
        tutGroup: "CS-2C",
        day: "Tue",
        startTime: "12:00",
        endTime: "14:00",
        location: "Hall A",
        sessionType: "Lecture",
        color: COLORS.PINK
    },

    // Wednesday
    {
        courseCode: "MATH201",
        courseName: "Discrete Mathematics",
        tutGroup: "CS-2C",
        day: "Wed",
        startTime: "11:00",
        endTime: "13:00",
        location: "Room 305",
        sessionType: "Lecture",
        color: COLORS.YELLOW
    },
    {
        courseCode: "ENG201",
        courseName: "Technical Writing",
        tutGroup: "CS-2C",
        day: "Wed",
        startTime: "15:00",
        endTime: "16:30",
        location: "Room 401",
        sessionType: "Lecture",
        color: COLORS.GREEN
    },

    // Thursday
    {
        courseCode: "CS101",
        courseName: "Intro to Programming",
        tutGroup: "CS-2C",
        day: "Thu",
        startTime: "09:00",
        endTime: "11:00",
        location: "Hall C",
        sessionType: "Lecture",
        color: COLORS.BLUE
    },
    {
        courseCode: "CS105",
        courseName: "Data Structures",
        tutGroup: "CS-2C",
        day: "Thu",
        startTime: "13:00",
        endTime: "15:00",
        location: "Room 203",
        sessionType: "Tutorial",
        color: COLORS.PINK
    },
    {
        courseCode: "CS104",
        courseName: "Web Development",
        tutGroup: "CS-2C",
        day: "Thu",
        startTime: "16:00",
        endTime: "18:00",
        location: "Hall B",
        sessionType: "Tutorial",
        color: COLORS.BLUE
    },

    // Friday
    {
        courseCode: "CS102",
        courseName: "Database Systems",
        tutGroup: "CS-2C",
        day: "Fri",
        startTime: "10:00",
        endTime: "12:00",
        location: "Lab 2B",
        sessionType: "Lab",
        color: COLORS.PINK
    },
    {
        courseCode: "MATH201",
        courseName: "Discrete Mathematics",
        tutGroup: "CS-2C",
        day: "Fri",
        startTime: "14:00",
        endTime: "16:00",
        location: "Hall A",
        sessionType: "Tutorial",
        color: COLORS.YELLOW
    }
];

const seedData = async () => {
    try {
        console.log("🚀 Starting seed script...");

        // 1. Connect to DB
        await connectDB();
        // Since connectDB already logs connection status, we don't need to log success here
        // But we can check if mongoose.connection.db is available
        if (mongoose.connection.db) {
            console.log(`✅ Database selected: ${mongoose.connection.db.databaseName}`);
        }

        // 2. Clear existing entries for these groups
        const groups = ["CS-2A", "CS-2B", "CS-2C"];
        console.log(`🗑️ Clearing existing entries for groups: ${groups.join(", ")}`);

        const deleteResult = await TimetableEntry.deleteMany({ tutGroup: { $in: groups } });
        console.log(`info: Deleted ${deleteResult.deletedCount} old entries.`);

        // 3. Insert new data
        console.log(`📝 Inserting ${timetableData.length} new entries...`);
        const insertResult = await TimetableEntry.insertMany(timetableData);
        console.log(`✅ Seeded ${insertResult.length} timetable entries successfully!`);

        // 4. Exit
        console.log("👋 Seed script finished. Exiting...");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error);

        // Print more details if available
        if (error.name === 'MongooseServerSelectionError') {
            console.error("   Reason: Could not connect to MongoDB server. Check IP whitelist or internet connection.");
        }

        process.exit(1);
    }
};

seedData();
