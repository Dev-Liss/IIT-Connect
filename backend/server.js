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
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const morgan = require("morgan");

const connectDB = require("./config/db");
const logger = require("./config/logger");

// Import Routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const storyRoutes = require("./routes/stories");
const userRoutes = require("./routes/users");
const eventsRoutes = require("./routes/events");
const announcementsRoutes = require("./routes/announcements");
const reportsRoutes = require("./routes/reports");
const { startStoryCleanupJob } = require("./jobs/storyCleanup");
const conversationRoutes = require("./routes/conversation");
const messageRoutes = require("./routes/message");
const uploadRoutes = require("./routes/upload");

// Import Socket Handler
const socketHandler = require("./socket/socketHandler");

// ====================================
// UNCAUGHT EXCEPTION / REJECTION HANDLERS
// ====================================
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION – shutting down", { error: err.message, stack: err.stack });
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.error("UNHANDLED REJECTION – shutting down", { reason: String(reason) });
  process.exit(1);
});

// ====================================
// APP INITIALISATION
// ====================================
const app = express();

// Trust first proxy (if behind nginx / load-balancer)
app.set("trust proxy", 1);

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

// Allowed origins – extend this list as needed
const ALLOWED_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["*"];

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
  // Socket.io optimization for real-time messaging
  pingTimeout: 30000,
  pingInterval: 15000,
  maxHttpBufferSize: 1e6, // 1 MB max payload per socket message
  transports: ["websocket", "polling"],
  allowUpgrades: true,
  perMessageDeflate: {
    threshold: 1024, // Compress messages larger than 1KB
  },
  httpCompression: {
    threshold: 1024,
  },
});

// Initialize Socket.io handler
socketHandler(io);

// ====================================
// SECURITY MIDDLEWARE
// ====================================
// HTTP security headers
app.use(helmet());

// CORS – configurable via env
app.use(
  cors({
    origin: ALLOWED_ORIGINS.includes("*") ? true : ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    maxAge: 86400, // preflight cache 24 h
  })
);

// Sanitise data against NoSQL injection ($gt, $ne etc.)
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// ====================================
// RATE LIMITING
// ====================================
// Global limiter – 500 requests per 15 min window per IP (higher for messaging apps)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});
app.use("/api", globalLimiter);

// Stricter limiter for auth routes – 20 requests per 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, please try again later" },
});
app.use("/api/auth", authLimiter);

// ====================================
// BODY PARSING & COMPRESSION
// ====================================
// Parse incoming JSON – cap body size to 10 KB (file uploads go through multer)
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Gzip / Brotli compression for responses
app.use(compression());

// ====================================
// REQUEST LOGGING
// ====================================
// Use Morgan to log HTTP requests through Winston
const morganFormat = process.env.NODE_ENV === "production" ? "combined" : "dev";
app.use(morgan(morganFormat, { stream: logger.stream }));

// ====================================
// ROUTES
// ====================================
// Health check endpoint – useful for testing if server is running
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "IIT Connect API is running!",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Authentication routes (login, register)
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/users", userRoutes);

// ====================================
// ERROR HANDLERS
// ====================================
// Catch multer errors (file too large, wrong type, etc.) and return JSON
// Without this, multer sends an HTML error page which crashes response.json() on the app
app.use((err, req, res, next) => {
  if (err.name === "MulterError" || err.message?.includes("file")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Timetable routes
const timetableRoutes = require("./routes/timetable");
app.use("/api/timetable", timetableRoutes);

// Kuppi routes
const kuppiRoutes = require("./routes/kuppi");
app.use("/api/kuppi", kuppiRoutes);

// Resource routes
const resourceRoutes = require("./routes/resources");
app.use("/api/resources", resourceRoutes);


// Events routes
app.use("/api/events", eventsRoutes);

// Announcements routes
app.use("/api/announcements", announcementsRoutes);

// Reports routes (anonymous)
app.use("/api/reports", reportsRoutes);

// Messaging routes
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Media upload routes
app.use("/api/upload", uploadRoutes);

// ====================================
// 404 HANDLER
// ====================================
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ====================================
// GLOBAL ERROR HANDLER
// ====================================
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
  });

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ====================================
// DATABASE CONNECTION & SERVER START
// ====================================
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, "0.0.0.0", () => {
      logger.info(`Server running on http://0.0.0.0:${PORT}`);
      logger.info(`Mobile app should connect to: http://YOUR_IP:${PORT}/api`);
      logger.info("Socket.io ready for connections");

      // Start the story cleanup CRON job (deletes expired Cloudinary media)
      startStoryCleanupJob();

      // Check timetable JSON data on startup
      const fs = require('fs');
      const path = require('path');
      const dataPath = path.join(__dirname, 'data/timetable.json');
      if (fs.existsSync(dataPath)) {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const keys = Object.keys(data).slice(0, 2);
        logger.info(`Timetable JSON initialized completely! Keys: ${keys.join(', ')}`);
      }

    });
  })
  .catch((err) => {
    logger.error("Failed to connect to database", { error: err.message });
    process.exit(1);
  });

// ====================================
// GRACEFUL SHUTDOWN
// ====================================
const shutdown = (signal) => {
  logger.info(`${signal} received – shutting down gracefully`);
  server.close(() => {
    logger.info("HTTP server closed");
    const mongoose = require("mongoose");
    mongoose.connection.close(false).then(() => {
      logger.info("MongoDB connection closed");
      process.exit(0);
    });
  });

  // Force exit after 10 s if graceful shutdown stalls
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
