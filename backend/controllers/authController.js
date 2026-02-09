/**
 * ====================================
 * AUTH CONTROLLER - CLERK INTEGRATION
 * ====================================
 * Handles user profile syncing after Clerk authentication
 * Clerk handles: authentication, password, email verification
 * MongoDB stores: user profiles, role-specific data
 */

const User = require("../models/user");

/**
 * Sync user profile to MongoDB after Clerk signup/login
 * Called from mobile app after successful Clerk authentication
 */
const syncUserProfile = async (req, res) => {
  try {
    const { clerkId, email, role, studentId, nationalId, pastIitId, username } = req.body;

    // Validate required fields
    if (!clerkId || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: clerkId, email, role",
      });
    }

    // Validate role
    if (!["student", "lecture", "alumni"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be student, lecture, or alumni",
      });
    }

    // IMPORTANT: Keep custom email validation for role verification
    const emailUsername = email.split("@")[0];
    const hasNumbers = /\d/.test(emailUsername);

    // Students must have numbers in their email
    if (role === "student" && !hasNumbers) {
      return res.status(400).json({
        success: false,
        message: "This is a lecturer email format. Students must have numbers in their IIT email (e.g., john.20231234@iit.ac.lk)",
      });
    }

    // Lecturers must NOT have numbers in their email
    if (role === "lecture" && hasNumbers) {
      return res.status(400).json({
        success: false,
        message: "This is a student email format. Lecturers cannot have numbers in their IIT email (e.g., john.d@iit.ac.lk)",
      });
    }

    // Students and lecturers must use @iit.ac.lk domain
    if ((role === "student" || role === "lecture") && !email.toLowerCase().endsWith("@iit.ac.lk")) {
      return res.status(400).json({
        success: false,
        message: "Students and Lecturers must use an @iit.ac.lk email address",
      });
    }

    // Build user data object
    const userData = {
      clerkId,
      email: email.toLowerCase().trim(),
      username: username || "User",
      role,
    };

    // Add role-specific fields
    if (role === "student" && studentId) {
      userData.studentId = studentId;
    } else if (role === "alumni") {
      if (nationalId) {
        userData.alumniId = nationalId;
      }
      if (pastIitId) {
        userData.pastIitId = pastIitId;
      }
    }

    // Create or update user profile in MongoDB
    // upsert: true creates if doesn't exist, new: true returns updated doc
    const user = await User.findOneAndUpdate(
      { clerkId },
      userData,
      { upsert: true, new: true, runValidators: true }
    );

    console.log("✅ User profile synced:", user.email);

    res.status(200).json({
      success: true,
      message: "Profile synced successfully",
      user: {
        id: user._id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Profile sync error:", error);

    // Handle duplicate clerkId or email
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "User profile already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to sync profile",
      error: error.message,
    });
  }
};

/**
 * Get user profile by clerkId
 * Used to fetch additional profile data after Clerk authentication
 */
const getUserProfile = async (req, res) => {
  try {
    const { clerkId } = req.params;

    const user = await User.findOne({ clerkId }).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("❌ Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};

module.exports = {
  syncUserProfile,
  getUserProfile,
};
