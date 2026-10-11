
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      await mongoose.connection.asPromise();
      return mongoose.connection;
    }

    const connection = await mongoose.connect(
      process.env.MONGO_URI_2
    );

    console.log(
      `MongoDB connected: ${connection.connection.host}`
    );

    return connection.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

module.exports = connectDB;
