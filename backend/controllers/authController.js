/**
 * ====================================
 * AUTH CONTROLLER - FIREBASE INTEGRATION
 * ====================================
 * Handles user profile syncing after Firebase authentication
 * Firebase handles: authentication, password, email verification
 * MongoDB stores: user profiles, role-specific data
 */

const User = require("../models/user");

/**
 * Sync user profile to MongoDB after Firebase signup/login
 * Called from mobile app after successful Firebase authentication
 */
const syncUserProfile = async (req, res) => {
  console.log("🔵 ========== SYNC PROFILE REQUEST RECEIVED ==========");
  console.log("📥 Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { uid, email, role, studentId, nationalId, pastIitId, username } = req.body;

    // Validate required fields
    if (!uid || !email || !role) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: uid, email, role",
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
      clerkId: uid,
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

    // Check if user exists by email (in case Clerk user was deleted and recreated)
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && user.clerkId !== uid) {
      console.log(`🔄 Updating existing user ${user.email} with new Firebase uid`);
      user.clerkId = uid;
    }

    if (!user) {
      // Create new user
      user = new User(userData);
    } else {
      // Update existing user
      Object.assign(user, userData);
    }

    // Save the user
    await user.save();

    console.log("✅ User profile synced:", user.email);

    res.status(200).json({
      success: true,
      message: "Profile synced successfully",
      user: {
        id: user._id,
        uid: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Profile sync error:", error);

    // Handle duplicate uid/email
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
 * Get user profile by uid
 * Used to fetch additional profile data after Firebase authentication
 */
const getUserProfile = async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ clerkId: uid }).select("-__v");

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

const fs = require("fs");
const path = require("path");

/**
 * Validate Alumni credentials against JSON database
 */
const validateAlumniCredentials = async (req, res) => {
  const { nationalId, iitId } = req.body;

  if (!nationalId || !iitId) {
    return res.status(400).json({
      success: false,
      message: "National ID and IIT ID are required",
    });
  }

  try {
    // Step 1: Check if these IDs are already registered in MongoDB
    const existingAlumni = await User.findOne({
      role: "alumni",
      alumniId: nationalId,
      pastIitId: iitId,
    });

    if (existingAlumni) {
      return res.status(400).json({
        success: false,
        message: "An alumni account already exists for these credentials. Please login instead.",
        accountExists: true,
      });
    }

    // Step 2: Load alumni records from JSON file
    const dataPath = path.join(__dirname, "../data/alumni_records.json");
    const alumniRecords = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    // Step 3: Find record matching BOTH national ID and IIT ID
    const validAlumni = alumniRecords.find(
      (record) => record.nationalId === nationalId && record.iitId === iitId
    );

    if (validAlumni) {
      return res.status(200).json({
        success: true,
        message: "Alumni credentials validated successfully",
        alumniName: validAlumni.name,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid alumni credentials. Please check your IDs and try again.",
      });
    }
  } catch (error) {
    console.log("ℹ️ Alumni validation error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error accessing alumni database",
    });
  }
};


/**
 * Sync Google User
 * Called after Google OAuth success on mobile
 * Ensures user exists in our DB and links the Firebase UID if needed
 */
const syncGoogleUser = async (req, res) => {
  console.log("🔵 ========== SYNC GOOGLE USER REQUEST RECEIVED ==========");
  try {
    const { email, uid, username } = req.body;
    console.log(`📥 Request Data - Email: ${email}, uid: ${uid}`);

    if (!email || !uid) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: email, uid",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`🔍 Searching MongoDB for: ${normalizedEmail}`);

    // Find user by email
    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // User doesn't exist - we do not auto-create profile records here.

      console.log("📤 Sending 404 Requires Signup");
      return res.status(404).json({
        success: false,
        message: "No account found for this email. Please sign up first.",
        requiresSignup: true
      });
    }

    console.log(`✅ User found! Linking/updating uid for: ${user.email}`);
    if (user.clerkId !== uid) {
      console.log(`🔄 Updating uid for ${normalizedEmail}`);
      user.clerkId = uid;
      await user.save();
    }

    console.log("✅ Google User synced successfully");
    res.status(200).json({
      success: true,
      message: "User synced successfully",
      user: {
        id: user._id,
        uid: user.clerkId,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("❌ Google sync error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to sync google user",
      error: error.message,
    });
  }
};

module.exports = {
  syncUserProfile,
  getUserProfile,
  validateAlumniCredentials,
  syncGoogleUser
};
