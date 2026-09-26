const mongoose = require("mongoose");

const orderAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Shipping full name is required"],
      trim: true,
      maxlength: [100, "Shipping full name cannot exceed 100 characters"]
    },

    phone: {
      type: String,
      required: [true, "Shipping phone number is required"],
      trim: true,
      maxlength: [20, "Shipping phone number cannot exceed 20 characters"]
    },

    addressLine: {
      type: String,
      required: [true, "Shipping address is required"],
      trim: true,
      maxlength: [200, "Shipping address cannot exceed 200 characters"]
    },

    city: {
      type: String,
      required: [true, "Shipping city is required"],
      trim: true,
      maxlength: [100, "Shipping city cannot exceed 100 characters"]
    },

    state: {
      type: String,
      required: [true, "Shipping state is required"],
      trim: true,
      maxlength: [100, "Shipping state cannot exceed 100 characters"]
    },

    postalCode: {
      type: String,
      required: [true, "Shipping postal code is required"],
      trim: true,
      maxlength: [20, "Shipping postal code cannot exceed 20 characters"]
    },

    country: {
      type: String,
      required: [true, "Shipping country is required"],
      trim: true,
      maxlength: [100, "Shipping country cannot exceed 100 characters"]
    }
  },
  {
    _id: false
  }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Order item product is required"]
    },

    name: {
      type: String,
      required: [true, "Order item name is required"],
      trim: true,
      maxlength: [200, "Order item name cannot exceed 200 characters"]
    },

    price: {
      type: Number,
      required: [true, "Order item price is required"],
      min: [0, "Order item price cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message:
          "Order item price must be an integer in the smallest currency unit"
      }
    },

    quantity: {
      type: Number,
      required: [true, "Order item quantity is required"],
      min: [1, "Order item quantity must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Order item quantity must be an integer"
      }
    }
  },
  {
    _id: true
  }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Order user is required"],
      index: true
    },

    items: {
      type: [orderItemSchema],
      required: [true, "Order must contain at least one item"],
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item"
      }
    },

    shippingAddress: {
      type: orderAddressSchema,
      required: [true, "Shipping address is required"]
    },

    subtotal: {
      type: Number,
      required: [true, "Order subtotal is required"],
      min: [0, "Order subtotal cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message:
          "Order subtotal must be an integer in the smallest currency unit"
      }
    },

    shippingCost: {
      type: Number,
      required: [true, "Shipping cost is required"],
      min: [0, "Shipping cost cannot be negative"],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message:
          "Shipping cost must be an integer in the smallest currency unit"
      }
    },

    total: {
      type: Number,
      required: [true, "Order total is required"],
      min: [0, "Order total cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message:
          "Order total must be an integer in the smallest currency unit"
      }
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ["pending", "paid", "failed"],
        message: "Invalid payment status"
      },
      default: "pending"
    },

    orderStatus: {
      type: String,
      enum: {
        values: [
          "pending",
          "confirmed",
          "processing",
          "shipped",
          "delivered",
          "cancelled"
        ],
        message: "Invalid order status"
      },
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);