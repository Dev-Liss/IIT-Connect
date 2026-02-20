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

// Timetable routes
const timetableRoutes = require("./routes/timetable");
app.use("/api/timetable", timetableRoutes);

// Kuppi routes
const kuppiRoutes = require("./routes/kuppi");
app.use("/api/kuppi", kuppiRoutes);

// Resource routes
const resourceRoutes = require("./routes/resources");
app.use("/api/resources", resourceRoutes);


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

      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(__dirname, 'data/timetable.json');
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const keys = Object.keys(data).slice(0, 2);
        console.log("Timetable JSON initialized completely!");
        console.log(`JSON mapping check: { "${keys[0] || 'empty'}": [...], "${keys[1] || 'empty'}": [...] }`);
      }
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });
