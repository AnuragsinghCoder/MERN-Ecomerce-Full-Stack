const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [100, "Category name cannot exceed 100 characters"]
    },

    slug: {
      type: String,
      required: [true, "Category slug is required"],
      trim: true,
      lowercase: true,
      unique: true,
      minlength: [2, "Category slug must be at least 2 characters"],
      maxlength: [100, "Category slug cannot exceed 100 characters"],
      match: [
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Category slug must contain only lowercase letters, numbers, and hyphens"
      ]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Category description cannot exceed 500 characters"]
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

categorySchema.index({ isActive: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;