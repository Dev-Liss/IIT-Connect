const mongoose = require("mongoose");

const ContentReportSchema = new mongoose.Schema(
  {
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    targetType: {
      type: String,
      required: true,
      enum: ["Post", "Reel"],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContentReport", ContentReportSchema);
