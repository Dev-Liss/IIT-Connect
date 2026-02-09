const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Define routes
router.get("/profile/:id", userController.getUserProfile);
router.put("/profile/:id", userController.updateUserProfile);

module.exports = router;
