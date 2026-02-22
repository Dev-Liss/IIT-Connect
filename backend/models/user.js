/**
 * ====================================
 * USER MODEL
 * ====================================
 * MongoDB schema for user accounts.
 *
 * Fields:
 * - username: Display name
 * - email: Unique identifier for login
 * - password: User's password (hashed with bcrypt)
 * - studentId: University student ID
 * - role: User type (student/lecturer/admin)
 * - createdAt: Account creation timestamp
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 12;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [50, "Username cannot exceed 50 characters"],
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
      select: false, // Never return password by default
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "lecturer", "admin"],
      default: "student",
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  },
);

// ====================================
// PRE-SAVE HOOK – hash password
// ====================================
UserSchema.pre("save", async function (next) {
  // Only hash if password was modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ====================================
// INSTANCE METHOD – compare passwords
// ====================================
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model
module.exports = mongoose.model("User", UserSchema);
