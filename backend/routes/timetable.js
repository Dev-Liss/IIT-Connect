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
    getTimetableByGroup,
} = require("../controllers/timetableController");

// Base route: /api/timetable

router.get("/", getTimetable);
router.get("/today", getTodayTimetable);
router.get("/:tutGroup", getTimetableByGroup);
router.post("/", createTimetableEntry);

module.exports = router;
