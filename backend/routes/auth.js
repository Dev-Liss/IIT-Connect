/**
 * ====================================
 * AUTH ROUTES - /api/auth
 * ====================================
 * Handles user registration and login.
 *
 * Endpoints:
 * - POST /api/auth/register - Create a new user
 * - POST /api/auth/login    - Login an existing user
 * - GET  /api/auth/users    - Get all users (for new chat)
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const User = require("../models/user");
const { generateToken } = require("../middleware/authMiddleware");
const logger = require("../config/logger");

// ====================================
// HELPERS – input sanitisation
// ====================================
/**
 * Strip characters that have no business in normal text inputs.
 * Removes < > to prevent HTML/script injection.
 */
const sanitiseText = (str) =>
  typeof str === "string" ? str.replace(/[<>]/g, "").trim() : "";

// ====================================
// REGISTER ROUTE
// POST /api/auth/register
// ====================================
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, studentId } = req.body;

    // Validate required fields
    if (!username || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: username, email, password, studentId",
      });
    }

    // Sanitise text fields
    const cleanUsername = sanitiseText(username);
    const cleanEmail = sanitiseText(email).toLowerCase();
    const cleanStudentId = sanitiseText(studentId);

    // Basic format checks
    if (cleanUsername.length < 3 || cleanUsername.length > 50) {
      return res.status(400).json({
        success: false,
        message: "Username must be between 3 and 50 characters",
      });
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user (password hashed automatically via pre-save hook)
    const newUser = new User({
      username: cleanUsername,
      email: cleanEmail,
      password,
      studentId: cleanStudentId,
    });

    await newUser.save();

    // Generate JWT
    const token = generateToken(newUser._id);

    logger.info("New user registered", { userId: newUser._id, email: cleanEmail });

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        studentId: newUser.studentId,
        role: newUser.role,
      },
    });
  } catch (err) {
    logger.error("Register error", { error: err.message });
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
});

// ====================================
// LOGIN ROUTE
// POST /api/auth/login
// ====================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const cleanEmail = sanitiseText(email).toLowerCase();

    // Find user and explicitly include password for comparison
    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user) {
      // Use generic message to avoid user enumeration
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Compare password (bcrypt hash)
    let isMatch = await user.comparePassword(password);

    // Backward compatibility: if the stored password is still plaintext
    // (pre-bcrypt accounts), check directly and migrate to bcrypt
    if (!isMatch && user.password === password) {
      isMatch = true;
      // Migrate: hash the plaintext password and save
      user.password = password; // pre-save hook will hash it
      await user.save();
      logger.info("Migrated plaintext password to bcrypt", { userId: user._id });
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    logger.info("User logged in", { userId: user._id });

    res.json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error("Login error", { error: err.message });
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

// ====================================
// GET ALL USERS ROUTE
// GET /api/auth/users
// ====================================
router.get("/users", async (req, res) => {
  try {
    const { excludeUserId } = req.query;

    let query = {};
    if (excludeUserId && mongoose.Types.ObjectId.isValid(excludeUserId)) {
      query._id = { $ne: excludeUserId };
    }

    const users = await User.find(query);

    res.json({
      success: true,
      users: users.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        department: user.department || "IIT Student",
      })),
    });
  } catch (err) {
    logger.error("Get users error", { error: err.message });
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
});

module.exports = router;
