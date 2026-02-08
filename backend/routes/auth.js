/**
 * ====================================
 * AUTH ROUTES - /api/auth
 * ====================================
 * Handles user registration and login.
 *
 * Endpoints:
 * - POST /api/auth/register - Create a new user
 * - POST /api/auth/login    - Login an existing user
 * - POST /api/auth/check-email - Check if email exists
 */

const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    checkEmailExists,
    resetPasswordRequest,
    resetPassword
} = require("../controllers/authController");

// ====================================
// REGISTER ROUTE
// POST /api/auth/register
// ====================================
router.post("/register", registerUser);

// ====================================
// LOGIN ROUTE
// POST /api/auth/login
// ====================================
router.post("/login", loginUser);

// ====================================
// CHECK EMAIL EXISTS ROUTE
// POST /api/auth/check-email
// ====================================
router.post("/check-email", checkEmailExists);

// ====================================
// PASSWORD RESET REQUEST ROUTE
// POST /api/auth/reset-password-request
// ====================================
router.post("/reset-password-request", resetPasswordRequest);

// ====================================
// PASSWORD RESET ROUTE
// POST /api/auth/reset-password
// ====================================
router.post("/reset-password", resetPassword);

module.exports = router;
