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
        // Filter for sessions that haven't ended yet (endTime > now)
        const now = new Date();
        const sessions = await Kuppi.find({
            endTime: { $gt: now }
        })
            .populate("organizer", "username studentId")
            .populate("attendees", "username")
            .sort({ startTime: 1 }); // Sort by start time ascending
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
        const { title, subject, location, maxAttendees, about, sessionMode, meetingLink, startTime, endTime } = req.body;

        const start = new Date(startTime);
        const end = new Date(endTime);

        if (end <= start) {
            return res.status(400).json({ msg: "End time must be after start time" });
        }

        // Derive date string for display
        const dateStr = start.toLocaleDateString();

        const newKuppi = new Kuppi({
            title,
            subject,
            date: dateStr,
            // time: timeStr, // Removed from schema requirement
            startTime: start,
            endTime: end,
            dateTime: start, // kept for backward compatibility
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
// @desc    Toggle join/leave a kuppi session
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
        const isJoined = kuppi.attendees.includes(userId);

        if (isJoined) {
            // LEAVE logic
            kuppi.attendees = kuppi.attendees.filter(id => id.toString() !== userId.toString());
            await kuppi.save();
            return res.json({ msg: "Left session", kuppi });
        } else {
            // JOIN logic
            // Check max attendees
            if (kuppi.attendees.length >= kuppi.maxAttendees) {
                return res.status(400).json({ msg: "Session is full" });
            }

            kuppi.attendees.push(userId);
            await kuppi.save();
            return res.json({ msg: "Joined session", kuppi });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
