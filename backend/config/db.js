/**
 * ====================================
 * DATABASE CONNECTION
 * ====================================
 * Handles MongoDB connection using Mongoose.
 *
 * Usage in server.js:
 *   const connectDB = require("./config/db");
 *   connectDB().then(() => startServer());
 */

const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      logger.error("MONGO_URI is not defined in .env file");
      process.exit(1);
    }

    // Connection options for resilience & performance
    const options = {
      maxPoolSize: 10,             // Maximum number of connections in the pool
      minPoolSize: 2,              // Minimum connections to keep open
      serverSelectionTimeoutMS: 5000, // Fail fast if server unavailable
      socketTimeoutMS: 45000,      // Close sockets after 45 s of inactivity
      family: 4,                   // Use IPv4, skip IPv6 lookups
    };

    // Mongoose event listeners
    mongoose.connection.on("connected", () => {
      logger.info("Mongoose connected to DB");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("Mongoose connection error", { error: err.message });
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("Mongoose disconnected from DB");
    });

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`, {
      database: conn.connection.name,
    });

    return conn;
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
