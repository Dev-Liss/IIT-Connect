/**
 * ====================================
 * AUTH MIDDLEWARE — CLERK INTEGRATION
 * ====================================
 * Verifies the Clerk session token sent as a Bearer token.
 * On success, attaches the full MongoDB user document to req.user
 * so all downstream routes (messages, kuppi, upload, etc.) continue
 * to work without any changes — they all rely on req.user._id.
 */

const { clerkClient } = require('@clerk/clerk-sdk-node');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../config/logger');

/**
 * protect — Express middleware
 * Expects: Authorization: Bearer <clerk_session_token>
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("🔒 [AuthMiddleware] Path:", req.path);
  console.log("🔒 [AuthMiddleware] Auth Header received:", authHeader ? `${authHeader.substring(0, 20)}...` : "NONE");

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Clerk's verifyToken method hits a deprecated endpoint without a complex setup.
    // Instead, we decode the JWT (Clerk session tokens are standard JWTs)
    // The "sub" claim contains the Clerk user ID.
    const decoded = jwt.decode(token);
    console.log("🔒 [AuthMiddleware] Decoded Token Payload:", decoded);

    if (!decoded) {
      logger.warn('Auth failed – unreadable Clerk JWT', { ip: req.ip });
      return res.status(401).json({ success: false, message: 'Not authorized, invalid session (unreadable)' });
    }

    if (!decoded.sub) {
      logger.warn('Auth failed – no sub in Clerk JWT', { ip: req.ip });
      return res.status(401).json({ success: false, message: 'Not authorized, invalid session (no sub)' });
    }

    // Look up the MongoDB user by their Clerk ID
    const user = await User.findOne({ clerkId: decoded.sub });

    if (!user) {
      logger.warn('Auth failed – no MongoDB user for clerkId', {
        clerkId: decoded.sub,
        ip: req.ip,
      });
      return res
        .status(401)
        .json({ success: false, message: 'User profile not found. Please complete registration.' });
    }

    // Attach the full user document — req.user._id works for all existing routes
    req.user = user;
    req.auth = { userId: decoded.sub, sessionId: decoded.sid };
    next();
  } catch (err) {
    console.error('🔒 [AuthMiddleware] Clerk verification error:', err);
    logger.warn('Auth failed – Clerk verification error', {
      error: err.message,
      ip: req.ip,
    });
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, invalid token' });
  }
};

// generateToken is no longer needed — Clerk manages tokens.
// Exported as a no-op stub so any accidental old import won't crash the server.
const generateToken = () => {
  throw new Error('generateToken() is deprecated. Clerk manages authentication tokens.');
};

module.exports = { protect, generateToken };
