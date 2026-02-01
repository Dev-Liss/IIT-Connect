const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // For now, we'll use the token as userId directly (since login doesn't generate JWT yet)
      // In production, you'd verify the JWT token
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = await User.findById(decoded.id).select('-password');

      // Temporary: Use userId from header (passed as token)
      const user = await User.findById(token).select('-password');

      if (user) {
        req.user = user;
        return next();
      }

      // If not a valid ObjectId, try to verify as JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'iit-connect-secret');
        req.user = await User.findById(decoded.id).select('-password');
        if (req.user) {
          return next();
        }
      } catch (jwtError) {
        // Not a valid JWT
      }

      res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    } catch (error) {
      console.log(error);
      res.status(401).json({ success: false, message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
