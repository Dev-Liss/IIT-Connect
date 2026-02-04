const express = require("express");
const router = express.Router();
const Kuppi = require("../models/Kuppi");
const User = require("../models/user"); // Assuming User model is needed for population if necessary
// const auth = require("../middleware/auth"); // Assuming we have auth middleware

// Middleware to simulate auth for now if not available, or use the real one if it exists. 
// Based on file list, there is middleware/authMiddleware.js, let's try to require it.
// If it fails, I'll add a dummy one.
let auth;
try {
    auth = require("../middleware/authMiddleware");
} catch (e) {
    // Dummy middleware if file not found or export issues
    auth = (req, res, next) => {
        // req.user = { id: "dummy_user_id" }; // This would need to be handled carefully
        next();
    };
}

// @route   GET /api/kuppi
// @desc    Get all upcoming sessions
// @access  Public (or Private)
router.get("/", async (req, res) => {
    try {
        // Sort by date/created at. 
        // For now, getting all. In real app, filter for future dates.
        const sessions = await Kuppi.find()
            .populate("organizer", "username studentId") // Populate organizer details
            .populate("attendees", "username") // Populate attendees details if needed
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
router.post("/create", async (req, res) => {
    console.log("Received Create Request Body:", req.body); // Debug log
    try {
        // We expect user to be authenticated and req.user.id to be available if using auth middleware
        // If not using real auth yet, we might need to send organizerId in body for testing

        // START TEMPORARY FIX: If no auth middleware active, expect organizer in body or use a default
        let organizerId = req.user ? req.user.id : req.body.organizer;
        if (!organizerId) {
            // Fallback or Error for now
            return res.status(401).json({ msg: "Unauthorized: No user found" });
        }
        // END TEMPORARY FIX

        const { title, subject, date, time, location, maxAttendees, about, sessionMode, meetingLink } = req.body;

        const newKuppi = new Kuppi({
            title,
            subject,
            date,
            time,
            location,
            maxAttendees,
            about,
            sessionMode,
            meetingLink,
            organizer: organizerId,
            attendees: [organizerId], // Organizer is automatically an attendee? Or separate? 
            // Taking cue from "10/15 members" - usually includes organizer or just participants.
            // Let's add organizer to attendees for now.
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
