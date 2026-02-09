const User = require("../models/user");

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
    const { username, bio, batch, profilePicture, coverPicture } = req.body;

    // Build user object
    const profileFields = {};
    if (username) profileFields.username = username;
    if (bio) profileFields.bio = bio;
    if (batch) profileFields.batch = batch;
    if (profilePicture) profileFields.profilePicture = profilePicture;
    if (coverPicture) profileFields.coverPicture = coverPicture;

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
