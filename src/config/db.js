const mongoose = require("mongoose");
const dotenv = require("dotenv");



dotenv.config();

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI_2);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message, process.env.MONGO_URI_2);
    throw error;
  }
};

module.exports = connectDB;