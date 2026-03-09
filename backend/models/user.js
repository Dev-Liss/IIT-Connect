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
    // Clerk user ID — set on first Clerk login/signup, sparse so legacy users
    // without it are not rejected by the unique constraint.
    clerkId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
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
    // Password is optional — Clerk manages authentication.
    // Kept for backward compatibility with existing documents.
    password: {
      type: String,
      required: false,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password by default
    },
    // studentId is optional — only populated for the student role.
    studentId: {
      type: String,
      required: false,
      trim: true,
    },
    // Alumni-specific identity fields
    alumniId: {
      type: String,
      required: false, // National ID for alumni verification
      trim: true,
    },
    pastIitId: {
      type: String,
      required: false, // Past IIT student ID for alumni
      trim: true,
    },
    role: {
      type: String,
      // 'lecture' is the value used by the Clerk auth branch;
      // 'lecturer' is used by the rest of the app — both are accepted.
      enum: ["student", "lecturer", "lecture", "admin", "alumni"],
      default: "student",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    profilePicturePublicId: {
      type: String,
      default: "", // Cloudinary public ID — used to delete old image on update
    },
    coverPicture: {
      type: String,
      default: "",
    },
    coverPicturePublicId: {
      type: String,
      default: "", // Cloudinary public ID — used to delete old image on update
    },
    batch: {
      type: String,
      default: "", // e.g., "L4 G1"
    },
    bio: {
      type: String,
      default: "",
    },
    graduationYear: {
      type: String,
      default: "",
    },
    currentJob: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    careerJourney: {
      type: String,
      default: "",
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
module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
