/**
 * ====================================
 * USER MODEL
 * ====================================
 * MongoDB schema for user accounts.
 *
 * Fields:
 * - username: Display name
 * - email: Unique identifier for login
 * - password: User's password (TODO: hash in Phase 3)
 * - studentId: University student ID
 * - role: User type (student/lecturer/admin)
 * - createdAt: Account creation timestamp
 */

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      // TODO Phase 3: Add bcrypt hashing via pre-save hook
    },
    studentId: {
      type: String,
      required: false, // Optional - only used for students
      trim: true,
    },
    alumniId: {
      type: String,
      required: false, // Optional - stores national ID for alumni
      trim: true,
    },
    pastIitId: {
      type: String,
      required: false, // Optional - stores past IIT ID for alumni
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "lecture", "alumni", "lecturer", "admin"],
      default: "student",
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  },
);

// Export the model
module.exports = mongoose.model("User", UserSchema);
