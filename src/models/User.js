const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [100, "Full name cannot exceed 100 characters"]
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number cannot exceed 20 characters"]
    },

    addressLine: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [200, "Address cannot exceed 200 characters"]
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"]
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State cannot exceed 100 characters"]
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true,
      maxlength: [20, "Postal code cannot exceed 20 characters"]
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
      maxlength: [100, "Country cannot exceed 100 characters"]
    }
  },
  {
    _id: true
  }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"]
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address"
      ]
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false
    },

    role: {
      type: String,
      enum: {
        values: ["customer", "admin"],
        message: "Role must be either customer or admin"
      },
      default: "customer"
    },

    isActive: {
      type: Boolean,
      default: true
    },

    addresses: {
      type: [addressSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);



module.exports = mongoose.model("User", userSchema);