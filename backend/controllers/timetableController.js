/**
 * ====================================
 * TIMETABLE CONTROLLER
 * ====================================
 * Handles requests for timetable data.
 */

const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/timetable.json');

const COLORS = ["#FFEBEB", "#E8F5E9", "#E3F2FD", "#FFF3E0", "#F3E5F5", "#E0F7FA", "#FFFDE7"];

function processLocalData(group, targetDay) {
  if (!fs.existsSync(dataPath)) {
    throw new Error("Timetable data not found");
  }
  const allData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const groupData = allData[group] || {};
  const entries = [];
  let colorIdx = 0;

  for (const [dayName, daySchedule] of Object.entries(groupData)) {
    const shortDay = dayName.substring(0, 3);
    if (targetDay && shortDay !== targetDay) continue;

    const sortedTimes = Object.keys(daySchedule).sort();
    let currentEntry = null;

    for (const time of sortedTimes) {
      const slot = daySchedule[time];

      if (slot === "Free") {
        if (currentEntry) {
          entries.push(currentEntry);
          currentEntry = null;
        }
        continue;
      }

      if (currentEntry &&
        currentEntry.courseCode === slot.module &&
        currentEntry.location === slot.room) {
        const hour = parseInt(time.split(":")[0], 10);
        currentEntry.endTime = `${(hour + 1).toString().padStart(2, '0')}:30`;
      } else {
        if (currentEntry) entries.push(currentEntry);

        const hour = parseInt(time.split(":")[0], 10);
        const nextHour = `${(hour + 1).toString().padStart(2, '0')}:30`;

        currentEntry = {
          _id: Math.random().toString(),
          courseCode: slot.module,
          courseName: slot.type,
          day: shortDay,
          startTime: time,
          endTime: nextHour,
          location: slot.room,
          color: COLORS[colorIdx % COLORS.length],
          lecturer: slot.lecturer,
          tutorialGroup: group,
        };
        colorIdx++;
      }
    }
    if (currentEntry) entries.push(currentEntry);
  }
  return entries;
}

exports.getAllGroups = async (req, res) => {
  try {
    if (!fs.existsSync(dataPath)) {
      return res.status(200).json({ success: true, data: [] });
    }
    const allData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    const groups = Object.keys(allData).sort();
    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

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

    const timetable = processLocalData(tutGroup);

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

    const timetable = processLocalData(tutGroup, todayName);

    res.status(200).json({
      success: true,
      day: todayName,
      count: timetable.length,
      classes: timetable,
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

/**
 * @desc    Get timetable by group (Path Parameter)
 * @route   GET /api/timetable/:tutGroup
 * @access  Public
 */
exports.getTimetableByGroup = async (req, res) => {
  try {
    const { tutGroup } = req.params;

    if (!tutGroup) {
      return res.status(400).json({
        success: false,
        message: "Tutorial group parameter is required",
      });
    }

    const timetable = processLocalData(tutGroup);

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (error) {
    console.error("Error fetching timetable by group:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
