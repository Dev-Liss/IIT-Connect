/**
 * ====================================
 * IIT CONNECT - BACKEND SERVER
 * ====================================
 * Main entry point for the Express server.
 * Team: Make sure to run 'npm install' before starting!
 * Start with: npm run dev (development) or npm start (production)
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const storyRoutes = require("./routes/stories");
const userRoutes = require("./routes/users");

// Initialize Express App
const app = express();

// ====================================
// MIDDLEWARE
// ====================================
// Enable CORS for all origins (allows mobile app to connect)
app.use(cors());
// Parse incoming JSON requests
app.use(express.json());

// ====================================
// ROUTES
// ====================================
// Health check endpoint - useful for testing if server is running
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "IIT Connect API is running!" });
});

// Authentication routes (login, register)
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/users", userRoutes);

// ====================================
// DATABASE CONNECTION & SERVER START
// ====================================
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
      console.log(
        `📱 Mobile app should connect to: http://YOUR_IP:${PORT}/api`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });
