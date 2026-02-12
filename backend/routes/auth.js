/**
 * ====================================
 * AUTH ROUTES - /api/auth
 * ====================================
 * Clerk Integration Routes
 *
 * Endpoints:
 * - POST /api/auth/sync-profile - Sync user profile to MongoDB after Clerk auth
 * - GET  /api/auth/profile/:clerkId - Get user profile
 * - POST /api/auth/check-email - Check if email exists (legacy compatibility)
 */

const express = require("express");
const router = express.Router();
const {
    syncUserProfile,
    getUserProfile,
    validateAlumniCredentials,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/clerkAuth");

// ====================================
// SYNC PROFILE ROUTE (Primary endpoint)
// POST /api/auth/sync-profile
// Called after Clerk signup/login to save profile data to MongoDB
// ====================================
router.post("/sync-profile", syncUserProfile);

// ====================================
// VALIDATE ALUMNI CREDENTIALS ROUTE
// POST /api/auth/validate-alumni
// Checks if national ID and IIT ID match a record in the JSON database
// ====================================
router.post("/validate-alumni", validateAlumniCredentials);

// ====================================
// GET USER PROFILE ROUTE
// GET /api/auth/profile/:clerkId
// Fetch user profile from MongoDB
// ====================================
router.get("/profile/:clerkId", getUserProfile);

// ====================================
// CHECK EMAIL EXISTS ROUTE (Legacy - for reference)
// POST /api/auth/check-email
// Note: With Clerk, email checking happens on Clerk's side
// This can be kept for backwards compatibility or removed
// ====================================
const User = require("../models/user");

router.post("/check-email", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        res.json({
            success: true,
            exists: !!user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error checking email",
        });
    }
});

module.exports = router;

