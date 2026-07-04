const User = require("../models/user");
const logger = require("../config/logger");
const { getFirebaseAdmin } = require("../config/firebaseAdmin");

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const admin = getFirebaseAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);

    // During migration we keep MongoDB `clerkId` unchanged.
    // Imported Firebase users should use the old clerkId as uid.
    const user = await User.findOne({ clerkId: decodedToken.uid });

    if (!user) {
      logger.warn("Auth failed – no MongoDB user for firebase uid", {
        uid: decodedToken.uid,
        ip: req.ip,
      });
      return res.status(401).json({
        success: false,
        message: "User profile not found. Please complete registration.",
      });
    }

    req.user = user;
    req.auth = {
      userId: decodedToken.uid,
      token: decodedToken,
    };
    req.firebaseUser = decodedToken;
    next();
  } catch (err) {
    logger.warn("Auth failed – Firebase token verification error", {
      error: err.message,
      ip: req.ip,
    });
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, invalid token" });
  }
};

const generateToken = () => {
  throw new Error(
    "generateToken() is deprecated. Firebase Authentication manages authentication tokens."
  );
};

module.exports = { protect, generateToken };
