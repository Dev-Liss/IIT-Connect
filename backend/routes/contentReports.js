const express = require("express");
const router = express.Router();
const ContentReport = require("../models/ContentReport");
const Post = require("../models/Post");
const Reel = require("../models/Reel");

// POST /api/content-reports
router.post("/", async (req, res) => {
  try {
    const { targetId, targetType, reportedBy, reason } = req.body;
    
    if (!targetId || !targetType || !reportedBy || !reason) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const report = new ContentReport({
      targetId,
      targetType,
      reportedBy,
      reason
    });
    
    await report.save();
    
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    console.error("Error creating content report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/content-reports
router.get("/", async (req, res) => {
  try {
    const reports = await ContentReport.find()
      .populate("reportedBy", "username email profilePic")
      .populate({
        path: "targetId",
        select: "caption media category user likes comments",
        populate: { path: "user", select: "username profilePic" }
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error("Error fetching content reports:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/content-reports/:id/dismiss
router.delete("/:id/dismiss", async (req, res) => {
  try {
    const report = await ContentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    await report.deleteOne();
    res.status(200).json({ success: true, message: "Report dismissed" });
  } catch (error) {
    console.error("Error dismissing content report:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// DELETE /api/content-reports/:id/remove-content
router.delete("/:id/remove-content", async (req, res) => {
  try {
    const report = await ContentReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    
    // Delete the referenced content
    if (report.targetType === "Post") {
      await Post.findByIdAndDelete(report.targetId);
    } else if (report.targetType === "Reel") {
      await Reel.findByIdAndDelete(report.targetId);
    }
    
    // Also delete any other reports for the same target content to cleanup
    await ContentReport.deleteMany({ targetId: report.targetId });
    
    res.status(200).json({ success: true, message: "Content removed and reports resolved" });
  } catch (error) {
    console.error("Error removing content:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
