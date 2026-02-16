/**
 * ====================================
 * REPORT ROUTES - /api/reports
 * ====================================
 * Handles lecturer interactions with user-submitted reports.
 *
 * Endpoints:
 * - GET  /api/reports        - Get all reports (with optional status filter)
 * - GET  /api/reports/:id    - Get a single report by ID
 * - PUT  /api/reports/:id/status - Update report status
 * - POST /api/reports/:id/response - Add lecturer response to report
 */

const express = require("express");
const router = express.Router();
const Report = require("../models/Report");

// ====================================
// GET ALL REPORTS
// GET /api/reports?status=pending
// ====================================
router.get("/", async (req, res) => {
    try {
        const { status } = req.query;

        // Build filter query
        const filter = {};
        if (status && ["pending", "ongoing", "solved", "rejected"].includes(status)) {
            filter.status = status;
        }

        // Fetch reports with populated user data
        const reports = await Report.find(filter)
            .populate("reportedBy", "username email")
            .populate("responses.user", "username")
            .sort({ createdAt: -1 }); // Newest first

        // Calculate counts by status
        const allReports = await Report.find();
        const counts = {
            pending: allReports.filter((r) => r.status === "pending").length,
            ongoing: allReports.filter((r) => r.status === "ongoing").length,
            solved: allReports.filter((r) => r.status === "solved").length,
            rejected: allReports.filter((r) => r.status === "rejected").length,
        };

        res.json({
            success: true,
            count: reports.length,
            counts,
            data: reports,
        });
    } catch (error) {
        console.error("❌ Fetch Reports Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch reports",
        });
    }
});

// ====================================
// GET SINGLE REPORT BY ID
// GET /api/reports/:id
// ====================================
router.get("/:id", async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("reportedBy", "username email")
            .populate("responses.user", "username");

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error("❌ Fetch Single Report Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch report",
        });
    }
});

// ====================================
// UPDATE REPORT STATUS
// PUT /api/reports/:id/status
// Body: { status: "ongoing" | "solved" | "rejected" }
// ====================================
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status
        if (!["pending", "ongoing", "solved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: pending, ongoing, solved, or rejected",
            });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Update status
        report.status = status;
        await report.save();

        console.log(`✅ Report ${report._id} status updated to: ${status}`);

        res.json({
            success: true,
            message: `Report status updated to ${status}`,
            data: report,
        });
    } catch (error) {
        console.error("❌ Update Status Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update report status",
        });
    }
});

// ====================================
// ADD RESPONSE TO REPORT
// POST /api/reports/:id/response
// Body: { userId, text }
// ====================================
router.post("/:id/response", async (req, res) => {
    try {
        const { userId, text } = req.body;

        // Validate input
        if (!userId || !text) {
            return res.status(400).json({
                success: false,
                message: "userId and text are required",
            });
        }

        if (!text.trim()) {
            return res.status(400).json({
                success: false,
                message: "Response text cannot be empty",
            });
        }

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        // Add response
        const newResponse = {
            user: userId,
            text: text.trim(),
            createdAt: new Date(),
        };

        report.responses.push(newResponse);
        await report.save();

        // Populate the new response user data
        await report.populate("responses.user", "username");

        console.log(`💬 Response added to report ${report._id} by user ${userId}`);

        res.status(201).json({
            success: true,
            message: "Response added successfully",
            data: report,
            responseCount: report.responses.length,
        });
    } catch (error) {
        console.error("❌ Add Response Error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to add response",
        });
    }
});

module.exports = router;
