const getTimetable = async (req, res) => {
  res.json({ message: "Get timetable" });
};

const updateTimetable = async (req, res) => {
  res.json({ message: "Update timetable" });
};

module.exports = {
  getTimetable,
  updateTimetable,
};
