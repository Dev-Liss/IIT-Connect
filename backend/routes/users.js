const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { uploadProfileImage } = require("../config/cloudinary");

router.get("/profile/:id", userController.getUserProfile);
router.put("/profile/:id", userController.updateUserProfile);

// Upload profile picture or cover banner to Cloudinary
// Field name must be "image", body must include: type "profile" | "cover"
router.post(
    "/profile/:id/upload-image",
    uploadProfileImage.single("image"),
    userController.uploadProfileImage
);

module.exports = router;
