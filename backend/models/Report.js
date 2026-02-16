/**
 * ====================================
 * REPORT MODEL
 * ====================================
 * MongoDB schema for user-submitted reports.
 * Lecturers can review, update status, and respond to reports.
 *
 * Fields:
 * - title: Report subject/title
 * - description: Detailed description of the issue
 * - status: Report status (pending/ongoing/solved/rejected)
 * - reportedBy: User who submitted the report
 * - category: Type of issue being reported
 * - responses: Array of lecturer responses
 * - createdAt/updatedAt: Timestamps
 */

const mongoose = require("mongoose");

// Response sub-document schema
const ResponseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        text: {
            type: String,
            required: true,
            trim: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { _id: true }
);

// Main Report schema
const ReportSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Report title is required"],
            trim: true,
            maxlength: [200, "Title cannot exceed 200 characters"],
        },
        description: {
            type: String,
            required: [true, "Report description is required"],
            trim: true,
            maxlength: [2000, "Description cannot exceed 2000 characters"],
        },
        status: {
            type: String,
            enum: ["pending", "ongoing", "solved", "rejected"],
            default: "pending",
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false, // Allow anonymous reports
        },
        category: {
            type: String,
            enum: [
                "behavior",
                "safety",
                "academic",
                "technical",
                "discrimination",
                "other",
            ],
            default: "other",
        },
        responses: [ResponseSchema],
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt
    }
);

// Virtual field for response count
ReportSchema.virtual("responseCount").get(function () {
    return this.responses ? this.responses.length : 0;
});

// Ensure virtuals are included when converting to JSON
ReportSchema.set("toJSON", { virtuals: true });
ReportSchema.set("toObject", { virtuals: true });

// Export the model
module.exports = mongoose.model("Report", ReportSchema);
