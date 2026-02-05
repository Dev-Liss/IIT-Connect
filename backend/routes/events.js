/**
 * ====================================
 * EVENTS ROUTES - /api/events
 * ====================================
 * Handles CRUD operations for university events.
 */

const express = require("express");
const router = express.Router();
const Event = require("../models/event");

// ====================================
// GET ALL EVENTS
// GET /api/events
// ====================================
router.get("/", async (req, res) => {
    try {
        const events = await Event.find({ isPublished: true })
            .sort({ eventDate: 1 })
            .populate("organizer", "username");

        res.json({
            success: true,
            count: events.length,
            events,
        });
    } catch (err) {
        console.error("Get Events Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// GET SINGLE EVENT
// GET /api/events/:id
// ====================================
router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate(
            "organizer",
            "username"
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.json({ success: true, event });
    } catch (err) {
        console.error("Get Event Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// CREATE EVENT
// POST /api/events
// ====================================
router.post("/", async (req, res) => {
    try {
        const { title, description, category, eventDate, startTime, endTime, location } =
            req.body;

        // Validate required fields
        if (!title || !description || !eventDate || !startTime || !endTime || !location) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const newEvent = new Event({
            title,
            description,
            category,
            eventDate,
            startTime,
            endTime,
            location,
        });

        await newEvent.save();

        res.status(201).json({
            success: true,
            message: "Event created successfully!",
            event: newEvent,
        });
    } catch (err) {
        console.error("Create Event Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// UPDATE EVENT
// PUT /api/events/:id
// ====================================
router.put("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.json({
            success: true,
            message: "Event updated successfully!",
            event,
        });
    } catch (err) {
        console.error("Update Event Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// DELETE EVENT
// DELETE /api/events/:id
// ====================================
router.delete("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.json({
            success: true,
            message: "Event deleted successfully!",
        });
    } catch (err) {
        console.error("Delete Event Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
