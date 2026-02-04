/**
 * ====================================
 * TIMETABLE CONTROLLER
 * ====================================
 * Handles requests for timetable data.
 */

const TimetableEntry = require("../models/timetableEntry");

/**
 * @desc    Get timetable for a specific tutorial group
 * @route   GET /api/timetable?tutGroup=CS-2A
 * @access  Public (or Protected later)
 */
exports.getTimetable = async (req, res) => {
  try {
    const { tutGroup } = req.query;

    if (!tutGroup) {
      return res.status(400).json({
        success: false,
        message: "Tutorial group (tutGroup) is required parameter",
      });
    }

    const timetable = await TimetableEntry.find({ tutGroup });

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (error) {
    console.error("Error fetching timetable:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Get today's timetable for a specific tutorial group
 * @route   GET /api/timetable/today?tutGroup=CS-2A
 * @access  Public
 */
exports.getTodayTimetable = async (req, res) => {
  try {
    const { tutGroup } = req.query;

    // Get current day name (e.g., "Mon", "Tue")
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const todayIndex = new Date().getDay();
    const todayName = days[todayIndex];

    if (!tutGroup) {
      return res.status(400).json({
        success: false,
        message: "Tutorial group (tutGroup) is required parameter",
      });
    }

    const timetable = await TimetableEntry.find({
      tutGroup,
      day: todayName,
    }).sort({ startTime: 1 }); // Sort by time

    res.status(200).json({
      success: true,
      day: todayName,
      count: timetable.length,
      classes: timetable, // Changed from 'data' to 'classes' as requested
    });
  } catch (error) {
    console.error("Error fetching today's timetable:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

/**
 * @desc    Create a new timetable entry (Admin)
 * @route   POST /api/timetable
 * @access  Private (Admin)
 */
exports.createTimetableEntry = async (req, res) => {
  try {
    const entry = await TimetableEntry.create(req.body);

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
