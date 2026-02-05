/**
 * ====================================
 * ANNOUNCEMENTS ROUTES - /api/announcements
 * ====================================
 * Handles CRUD operations for campus announcements.
 */

const express = require("express");
const router = express.Router();
const Announcement = require("../models/announcement");

// ====================================
// GET ALL ANNOUNCEMENTS
// GET /api/announcements
// ====================================
router.get("/", async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true })
            .sort({ createdAt: -1 })
            .populate("author", "username");

        res.json({
            success: true,
            count: announcements.length,
            announcements,
        });
    } catch (err) {
        console.error("Get Announcements Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// GET SINGLE ANNOUNCEMENT
// GET /api/announcements/:id
// ====================================
router.get("/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id).populate(
            "author",
            "username"
        );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        res.json({ success: true, announcement });
    } catch (err) {
        console.error("Get Announcement Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// CREATE ANNOUNCEMENT
// POST /api/announcements
// ====================================
router.post("/", async (req, res) => {
    try {
        const { title, content, source, priority } = req.body;

        // Validate required fields
        if (!title || !content || !source) {
            return res.status(400).json({
                success: false,
                message: "Title, content, and source are required",
            });
        }

        const newAnnouncement = new Announcement({
            title,
            content,
            source,
            priority: priority || "medium",
        });

        await newAnnouncement.save();

        res.status(201).json({
            success: true,
            message: "Announcement created successfully!",
            announcement: newAnnouncement,
        });
    } catch (err) {
        console.error("Create Announcement Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// UPDATE ANNOUNCEMENT
// PUT /api/announcements/:id
// ====================================
router.put("/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        res.json({
            success: true,
            message: "Announcement updated successfully!",
            announcement,
        });
    } catch (err) {
        console.error("Update Announcement Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// DELETE ANNOUNCEMENT
// DELETE /api/announcements/:id
// ====================================
router.delete("/:id", async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                success: false,
                message: "Announcement not found",
            });
        }

        res.json({
            success: true,
            message: "Announcement deleted successfully!",
        });
    } catch (err) {
        console.error("Delete Announcement Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
