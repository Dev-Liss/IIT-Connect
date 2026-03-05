/**
 * SEED SCRIPT - Test Reports
 * Creates sample reports in the database for testing
 * the Admin Dashboard feature.
 * 
 * Run: node seedReports.js
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error);
        process.exit(1);
    }
};

// Report Schema (simplified version without importing the model)
const ReportSchema = new mongoose.Schema({
    title: String,
    description: String,
    status: String,
    category: String,
    responses: [{
        user: mongoose.Schema.Types.ObjectId,
        text: String,
        createdAt: Date,
    }],
}, { timestamps: true });

const Report = mongoose.model("Report", ReportSchema);

// Sample test reports
const testReports = [
    {
        title: "Inappropriate behavior in tutorial group",
        description: "A student has been consistently making inappropriate comments during tutorial sessions, making other students uncomfortable.",
        status: "pending",
        category: "behavior",
        responses: [],
    },
    {
        title: "Safety concern in lab building",
        description: "The emergency exit on the 3rd floor of the CS building is blocked by equipment.",
        status: "ongoing",
        category: "safety",
        responses: [
            {
                text: "We have notified the facilities team and they will address this today.",
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            },
        ],
    },
    {
        title: "Suspected academic dishonesty",
        description: "Multiple students submitted identical code through a private group chat.",
        status: "pending",
        category: "academic",
        responses: [],
    },
    {
        title: "Portal login issues",
        description: "Unable to access the student portal for the past 2 days. Getting error 503.",
        status: "solved",
        category: "technical",
        responses: [
            {
                text: "The issue has been resolved. Server was experiencing high traffic and has been upgraded.",
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            },
            {
                text: "Please clear your browser cache and try again if still experiencing issues.",
                createdAt: new Date(Date.now() - 22 * 60 * 60 * 1000), // 22 hours ago
            },
        ],
    },
    {
        title: "Discrimination in club activities",
        description: "Some club members have been treated unfairly based on their background.",
        status: "ongoing",
        category: "discrimination",
        responses: [
            {
                text: "We take this matter very seriously and are investigating with the club committee.",
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
            },
        ],
    },
];

// Seed the database
const seedReports = async () => {
    try {
        // Clear existing reports (for testing)
        await Report.deleteMany({});
        console.log("🗑️  Cleared existing reports");

        // Insert test reports
        const createdReports = await Report.insertMany(testReports);
        console.log(`✅ Created ${createdReports.length} test reports`);

        // Display summary
        const counts = {
            pending: createdReports.filter(r => r.status === "pending").length,
            ongoing: createdReports.filter(r => r.status === "ongoing").length,
            solved: createdReports.filter(r => r.status === "solved").length,
        };

        console.log("\n📊 Report Summary:");
        console.log(`   Pending: ${counts.pending}`);
        console.log(`   Ongoing: ${counts.ongoing}`);
        console.log(`   Solved: ${counts.solved}`);
        console.log("\n✅ Database seeded successfully!");

    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        mongoose.connection.close();
    }
};

// Run the seed script
(async () => {
    await connectDB();
    await seedReports();
})();
