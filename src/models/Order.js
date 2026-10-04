const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"]
    },

    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Product price cannot be negative"]
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be an integer"
      }
    }
  },
  {
    _id: false
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true
    },

    addressLine: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true
    },

    postalCode: {
      type: String,
      required: [true, "Postal code is required"],
      trim: true
    },

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true
    }
  },
  {
    _id: false
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item"
      }
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },

    total: {
      type: Number,
      required: true,
      min: 0
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ],
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;