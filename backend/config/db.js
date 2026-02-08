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

const connectDB = async () => {
  try {
    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not defined in .env file");
      console.error("   Please add: MONGO_URI=your_mongodb_connection_string");
      process.exit(1);
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
    console.log(`🔗 URI: ${process.env.MONGO_URI.split("@")[1] || "hidden"}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
