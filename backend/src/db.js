const mongoose = require("mongoose");

async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Set MONGODB_URI in your .env file");
  }
  const uri = process.env.MONGODB_URI;
  if (/<[^>]+>/.test(uri)) {
    throw new Error("Replace the Atlas connection string placeholders in .env");
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
  });
  console.log("Connected to MongoDB Atlas");
}

module.exports = { mongoose, connectDB };
