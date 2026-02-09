const User = require("../models/user");

const registerUser = async (req, res) => {
  try {
    const { email, username, password, studentId, nationalId, pastIitId, role } = req.body;

    // Validate IIT email for students and lecturers
    if (role === "student" || role === "lecture") {
      if (!email || !email.toLowerCase().endsWith("@iit.ac.lk")) {
        return res.status(400).json({
          success: false,
          message: "Students and Lecturers must use an @iit.ac.lk email address.",
        });
      }

      // Validate email format matches the role
      const emailUsername = email.split("@")[0];
      const hasNumbers = /\d/.test(emailUsername);

      if (role === "student" && !hasNumbers) {
        return res.status(400).json({
          success: false,
          message: "This is a lecturer email, you cannot sign up as a student",
        });
      }

      if (role === "lecture" && hasNumbers) {
        return res.status(400).json({
          success: false,
          message: "This is a student email, you cannot sign up as a lecturer",
        });
      }

      // Additional validation for lecturer emails: must have format like name.letter@iit.ac.lk
      if (role === "lecture") {
        const lecturerPattern = /^[a-z]+\.[a-z]+$/i;
        if (!lecturerPattern.test(emailUsername)) {
          return res.status(400).json({
            success: false,
            message: "This is not a valid email. Lecturer emails should be in format: name.letter@iit.ac.lk",
          });
        }
      }
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists. Please login instead.",
        emailExists: true,
      });
    }

    // Create new user
    const userData = {
      username,
      email: email.toLowerCase().trim(),
      password,
      role,
    };

    // Only include studentId for students
    if (role === "student" && studentId) {
      userData.studentId = studentId;
    }

    // Only include alumniId and pastIitId for alumni
    if (role === "alumni") {
      if (nationalId) {
        userData.alumniId = nationalId;
      }
      if (pastIitId) {
        userData.pastIitId = pastIitId;
      }
    }

    const newUser = await User.create(userData);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Please sign up",
        userNotFound: true,
      });
    }

    // Check password (TODO: Use bcrypt.compare in Phase 3)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
        wrongPassword: true,
      });
    }

    // Success! Return user data (never send password!)
    res.json({
      success: true,
      message: "Login successful!",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again.",
    });
  }
};

const getMe = async (req, res) => {
  res.json({ message: "User data display" });
};

const checkEmailExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser) {
      return res.json({
        success: true,
        exists: true,
        message: "An account with this email already exists.",
      });
    }

    return res.json({
      success: true,
      exists: false,
      message: "Email is available",
    });
  } catch (error) {
    console.error("Email check error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while checking email.",
    });
  }
};

const resetPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email. Please sign up first.",
        userNotFound: true,
      });
    }

    // TODO: In production, send actual OTP via email service
    // For now, we'll simulate OTP sending
    console.log(`[Password Reset] OTP would be sent to: ${email}`);

    return res.json({
      success: true,
      message: "Verification code sent to your email",
      email: user.email,
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otpCode } = req.body;

    // Validate required fields
    if (!email || !newPassword || !otpCode) {
      return res.status(400).json({
        success: false,
        message: "Email, new password, and OTP code are required",
      });
    }

    // TODO: In production, verify OTP code from database/cache
    // For now, we'll accept any 5-digit code as valid
    if (!/^\d{5}$/.test(otpCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code format",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update password
    // TODO: In production, hash the password using bcrypt
    user.password = newPassword;
    await user.save();

    console.log(`[Password Reset] Password updated for: ${email}`);

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting password. Please try again.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  checkEmailExists,
  resetPasswordRequest,
  resetPassword,
};
