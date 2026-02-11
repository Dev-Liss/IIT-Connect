const express = require("express");
const router = express.Router();
const Kuppi = require("../models/Kuppi");
const User = require("../models/user"); // Assuming User model is needed for population if necessary
// const auth = require("../middleware/auth"); // Assuming we have auth middleware

// Middleware to simulate auth for now if not available, or use the real one if it exists. 
// Based on file list, there is middleware/authMiddleware.js, let's try to require it.
// If it fails, I'll add a dummy one.
const { protect } = require("../middleware/authMiddleware");

// @route   GET /api/kuppi
// @desc    Get all upcoming sessions
// @access  Public (or Private)
router.get("/", async (req, res) => {
    try {
        // Filter for upcoming sessions or ongoing sessions (started within last 2 hours)
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const sessions = await Kuppi.find({
            dateTime: { $gt: twoHoursAgo }
        })
            .populate("organizer", "username studentId")
            .populate("attendees", "username")
            .sort({ dateTime: 1 }); // Sort by nearest date ascending
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   GET /api/kuppi/my-sessions
// @desc    Get sessions organized by the current user
// @access  Private
router.get("/my-sessions", protect, async (req, res) => {
    try {
        const sessions = await Kuppi.find({ organizer: req.user.id })
            .populate("organizer", "username studentId")
            .populate("attendees", "username")
            .sort({ createdAt: -1 });
        res.json(sessions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   POST /api/kuppi/create
// @desc    Create a new kuppi session
// @access  Private
router.post("/create", protect, async (req, res) => {
    console.log("Received Create Request Body:", req.body);
    try {
        const { title, subject, location, maxAttendees, about, sessionMode, meetingLink, dateTime } = req.body;

        // Parse dateTime if it's a string, or expect ISO string from frontend
        const sessionDate = new Date(dateTime);

        // Derive date and time strings for legacy support / UI display if not provided explicitly, 
        // or just override them to ensure consistency with dateTime.
        // Format: "YYYY-MM-DD", "HH:mm" or similar based on locale? 
        // The existing frontend was sending free text. Let's make it structured or consistent string.
        // Actually, if we use toLocaleDateString, it might be server locale dependent.
        // Let's use simple ISO splitting or just store what frontend sends if they send date/time strings too.
        // But to be safe and consistent, let's derive:
        // formatting to "Weekday, DD Month" and time to "HH:MM AM/PM" would be nice but complex without library.
        // For now, let's trust frontend sent `date` and `time` strings correctly OR rely on `dateTime`.

        // However, I must ensure `dateTime` is saved.

        // If frontend sends `date` and `time` (human readable), I'll use those. 
        // If not, I'll default to ISO string parts.

        let dateStr = req.body.date;
        let timeStr = req.body.time;

        if (!dateStr || !timeStr) {
            // Fallback if not provided
            dateStr = sessionDate.toLocaleDateString();
            timeStr = sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        const newKuppi = new Kuppi({
            title,
            subject,
            date: dateStr,
            time: timeStr,
            dateTime: sessionDate, // Important field
            location,
            maxAttendees,
            about,
            sessionMode,
            meetingLink,
            organizer: req.user.id,
            attendees: [req.user.id], // Organizer is automatically an attendee
        });

        const kuppi = await newKuppi.save();
        res.json(kuppi);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// @route   POST /api/kuppi/join/:id
// @desc    Join a kuppi session
// @access  Private
router.post("/join/:id", async (req, res) => {
    try {
        let userId = req.user ? req.user.id : req.body.userId; // Fallback for testing
        if (!userId) {
            return res.status(401).json({ msg: "Unauthorized: No user found" });
        }

        const kuppi = await Kuppi.findById(req.params.id);

        if (!kuppi) {
            return res.status(404).json({ msg: "Session not found" });
        }

        // Check if already joined
        if (kuppi.attendees.includes(userId)) {
            return res.status(400).json({ msg: "Already joined this session" });
        }

        // Check max attendees
        if (kuppi.attendees.length >= kuppi.maxAttendees) {
            return res.status(400).json({ msg: "Session is full" });
        }

        kuppi.attendees.push(userId);
        await kuppi.save();

        res.json(kuppi);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
