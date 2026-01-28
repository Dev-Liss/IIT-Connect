/**
 * ====================================
 * AUTH ROUTES - /api/auth
 * ====================================
 * Handles user registration and login.
 *
 * Endpoints:
 * - POST /api/auth/register - Create a new user
 * - POST /api/auth/login    - Login an existing user
 */

const express = require("express");
const router = express.Router();

// ⚠️ IMPORTANT: File is 'user.js' (lowercase) - match exactly!
const User = require("../models/user");

// ====================================
// REGISTER ROUTE
// POST /api/auth/register
// ====================================
router.post("/register", async (req, res) => {
  try {
    // Extract user data from request body
    const { username, email, password, studentId } = req.body;

    // Validate required fields
    if (!username || !email || !password || !studentId) {
      return res.status(400).json({
        success: false,
        message:
          "All fields are required: username, email, password, studentId",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const newUser = new User({
      username,
      email,
      password, // TODO: Hash password with bcrypt in Phase 3
      studentId,
    });

    // Save to database
    await newUser.save();

    // Return success (don't send password back!)
    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        studentId: newUser.studentId,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ====================================
// LOGIN ROUTE
// POST /api/auth/login
// ====================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first.",
      });
    }

    // Check password (TODO: Use bcrypt.compare in Phase 3)
    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Success! Return user data (never send password!)
    res.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
