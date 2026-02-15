/**
 * ====================================
 * REPORT MODEL - Anonymous Reports
 * ====================================
 * Schema for anonymous incident reports.
 * No user reference to ensure anonymity.
 */

const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
    {
        subject: {
            type: String,
            required: [true, "Subject is required"],
            trim: true,
            maxlength: [100, "Subject cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "reviewing", "resolved", "dismissed"],
            default: "pending",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Report", ReportSchema);
