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
const User = require('../models/user');
const logger = require('../config/logger');

/**
 * protect — Express middleware
 * Expects: Authorization: Bearer <clerk_session_token>
 */
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify the Clerk session token and get the Clerk userId
    const session = await clerkClient.sessions.verifySession(token);

    if (!session || !session.userId) {
      logger.warn('Auth failed – invalid Clerk session', { ip: req.ip });
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, invalid session' });
    }

    // Look up the MongoDB user by their Clerk ID
    const user = await User.findOne({ clerkId: session.userId });

    if (!user) {
      logger.warn('Auth failed – no MongoDB user for clerkId', {
        clerkId: session.userId,
        ip: req.ip,
      });
      return res
        .status(401)
        .json({ success: false, message: 'User profile not found. Please complete registration.' });
    }

    // Attach the full user document — req.user._id works for all existing routes
    req.user = user;
    req.auth = { userId: session.userId, sessionId: session.id };
    next();
  } catch (err) {
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
