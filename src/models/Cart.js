const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Cart item product is required"]
    },

    quantity: {
      type: Number,
      required: [true, "Cart item quantity is required"],
      min: [1, "Cart item quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Cart item quantity must be an integer"
      }
    }
  },
  {
    _id: true
  }
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cart user is required"],
      unique: true
    },

    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

cartSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);