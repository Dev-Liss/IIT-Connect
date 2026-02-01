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
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

// Import Routes
const authRoutes = require("./routes/auth");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");

// Import Socket Handler
const socketHandler = require("./socket/socketHandler");

// Initialize Express App
const app = express();

// Create HTTP server and attach Socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for mobile app
    methods: ["GET", "POST"],
  },
});

// Initialize Socket.io handler
socketHandler(io);

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

// Messaging routes
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// ====================================
// DATABASE CONNECTION & SERVER START
// ====================================
const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
      console.log(`🔌 Socket.io ready for connections`);
      console.log(
        `📱 Mobile app should connect to: http://YOUR_IP:${PORT}/api`,
      );
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to database:", err);
    process.exit(1);
  });
