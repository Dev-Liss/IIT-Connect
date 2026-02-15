/**
 * ====================================
 * REPORTS ROUTES - /api/reports
 * ====================================
 * Handles CRUD operations for anonymous reports.
 * No authentication required to maintain anonymity.
 */

const express = require("express");
const router = express.Router();
const Report = require("../models/report");

// ====================================
// GET ALL REPORTS (Admin use)
// GET /api/reports
// ====================================
router.get("/", async (req, res) => {
    try {
        const reports = await Report.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reports.length,
            reports,
        });
    } catch (err) {
        console.error("Get Reports Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// GET SINGLE REPORT
// GET /api/reports/:id
// ====================================
router.get("/:id", async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.json({ success: true, report });
    } catch (err) {
        console.error("Get Report Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// CREATE REPORT (Anonymous)
// POST /api/reports
// ====================================
router.post("/", async (req, res) => {
    try {
        const { subject, description } = req.body;

        if (!subject || !description) {
            return res.status(400).json({
                success: false,
                message: "Subject and description are required",
            });
        }

        const newReport = new Report({
            subject,
            description,
        });

        await newReport.save();

        res.status(201).json({
            success: true,
            message: "Report submitted anonymously!",
            report: newReport,
        });
    } catch (err) {
        console.error("Create Report Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// UPDATE REPORT STATUS (Admin use)
// PUT /api/reports/:id
// ====================================
router.put("/:id", async (req, res) => {
    try {
        const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.json({
            success: true,
            message: "Report updated successfully!",
            report,
        });
    } catch (err) {
        console.error("Update Report Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ====================================
// DELETE REPORT
// DELETE /api/reports/:id
// ====================================
router.delete("/:id", async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.id);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: "Report not found",
            });
        }

        res.json({
            success: true,
            message: "Report deleted successfully!",
        });
    } catch (err) {
        console.error("Delete Report Error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
