const { protect } = require("./authMiddleware");

const requireAuth = protect;

module.exports = { requireAuth };
