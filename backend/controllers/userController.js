const User = require("../models/user");
const { cloudinary } = require("../config/cloudinary");

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private (or Public depending on requirements)
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password"); // Exclude password

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(user);
    } catch (err) {
        console.error(err.message);
        if (err.kind === "ObjectId") {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(500).send("Server Error");
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile/:id
// @access  Private
exports.updateUserProfile = async (req, res) => {
    const {
        username, bio, batch, tutorialGroup,
        profilePicture, coverPicture,
        graduationYear, currentJob, company, location, careerJourney
    } = req.body;

    // Build user object — only include fields that were actually sent
    const profileFields = {};
    if (username !== undefined) profileFields.username = username;
    if (bio !== undefined) profileFields.bio = bio;
    if (batch !== undefined) profileFields.batch = batch;
    if (tutorialGroup !== undefined) profileFields.tutorialGroup = tutorialGroup;
    if (profilePicture !== undefined) profileFields.profilePicture = profilePicture;
    if (coverPicture !== undefined) profileFields.coverPicture = coverPicture;
    if (graduationYear !== undefined) profileFields.graduationYear = graduationYear;
    if (currentJob !== undefined) profileFields.currentJob = currentJob;
    if (company !== undefined) profileFields.company = company;
    if (location !== undefined) profileFields.location = location;
    if (careerJourney !== undefined) profileFields.careerJourney = careerJourney;

    try {
        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // TODO: Check if req.user.id matches req.params.id (Authorization)
        // For now, assuming the middleware handles basic auth or we confim identity here

        user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: profileFields },
            { new: true }
        ).select("-password");

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

// @desc    Upload profile picture or cover banner to Cloudinary
// @route   POST /api/users/profile/:id/upload-image
// @access  Private
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No image file provided." });
        }

        const { type } = req.body; // "profile" or "cover"
        if (type !== "profile" && type !== "cover") {
            return res.status(400).json({ message: 'type must be "profile" or "cover".' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Delete the previous Cloudinary image if one exists
        const oldPublicId = type === "profile"
            ? user.profilePicturePublicId
            : user.coverPicturePublicId;

        if (oldPublicId) {
            try {
                await cloudinary.uploader.destroy(oldPublicId);
                console.log(`🗑️  Deleted old ${type} image:`, oldPublicId);
            } catch (err) {
                console.log(`⚠️  Could not delete old ${type} image:`, err.message);
            }
        }

        // multer-storage-cloudinary already uploaded the new file by this point
        const newUrl = req.file.path;     // Cloudinary secure URL
        const newPublicId = req.file.filename; // Cloudinary public ID

        const updateFields = type === "profile"
            ? { profilePicture: newUrl, profilePicturePublicId: newPublicId }
            : { coverPicture: newUrl, coverPicturePublicId: newPublicId };

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        console.log(`✅ ${type} image updated for user:`, req.params.id);
        res.json({ success: true, user: updatedUser });

    } catch (err) {
        console.error("❌ Upload Profile Image Error:", err.message);
        res.status(500).send("Server Error");
    }
};
