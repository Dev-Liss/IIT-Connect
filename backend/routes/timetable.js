/**
 * ====================================
 * TIMETABLE ROUTES
 * ====================================
 */

const express = require("express");
const router = express.Router();
const {
    getTimetable,
    createTimetableEntry,
    getTodayTimetable,
} = require("../controllers/timetableController");

// Base route: /api/timetable

router.get("/", getTimetable);
router.get("/today", getTodayTimetable);
router.post("/", createTimetableEntry);

module.exports = router;
