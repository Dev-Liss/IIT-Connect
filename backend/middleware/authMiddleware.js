const jwt = require('jsonwebtoken');
const User = require('../models/user');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'iit-connect-secret-change-me';

/**
 * Generate a signed JWT for a user
 * @param {string} userId - MongoDB _id of the user
 * @returns {string} signed JWT
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Auth middleware – verifies Bearer token (JWT **or** raw userId for dev compat).
 * In production only JWT is accepted.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    // 1. Try JWT verification first (preferred)
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
      return next();
    }
  } catch (jwtError) {
    // Token was not a valid JWT – fall through to ObjectId check in dev only
  }

  // 2. Development fallback: accept raw MongoDB ObjectId as token
  if (process.env.NODE_ENV !== 'production') {
    try {
      const mongoose = require('mongoose');
      if (mongoose.Types.ObjectId.isValid(token)) {
        const user = await User.findById(token);
        if (user) {
          req.user = user;
          return next();
        }
      }
    } catch {
      // ignore
    }
  }

  logger.warn('Auth failed – invalid token', { ip: req.ip });
  return res
    .status(401)
    .json({ success: false, message: 'Not authorized, invalid token' });
};

module.exports = { protect, generateToken, JWT_SECRET };
