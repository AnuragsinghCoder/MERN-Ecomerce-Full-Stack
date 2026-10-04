const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");

const SHIPPING_COST = 0;

const ORDER_STATUS_TRANSITIONS = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: []
};

const validateShippingAddress = (address) => {
  const requiredFields = [
    "fullName",
    "phone",
    "addressLine",
    "city",
    "state",
    "postalCode",
    "country"
  ];

  if (!address || typeof address !== "object") {
    return "Shipping address is required";
  }

  for (const field of requiredFields) {
    if (
      typeof address[field] !== "string" ||
      !address[field].trim()
    ) {
      return `${field} is required`;
    }
  }

  return null;
};

const createOrder = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const addressError = validateShippingAddress(
      req.body.shippingAddress
    );

    if (addressError) {
      return res.status(400).json({
        success: false,
        error: {
          message: addressError,
          code: "INVALID_SHIPPING_ADDRESS"
        }
      });
    }

    let createdOrder;

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({
        user: req.user._id
      }).session(session);

      if (!cart || cart.items.length === 0) {
        const error = new Error("Cart is empty");
        error.statusCode = 400;
        error.code = "CART_EMPTY";
        throw error;
      }

      const productIds = cart.items.map((item) => item.product);

      const products = await Product.find({
        _id: { $in: productIds },
        isActive: true
      }).session(session);

      if (products.length !== cart.items.length) {
        const error = new Error(
          "One or more products are unavailable"
        );
        error.statusCode = 400;
        error.code = "PRODUCT_UNAVAILABLE";
        throw error;
      }

      const productMap = new Map(
        products.map((product) => [
          product._id.toString(),
          product
        ])
      );

      const orderItems = [];
      let subtotal = 0;

      for (const cartItem of cart.items) {
        const product = productMap.get(
          cartItem.product.toString()
        );

        if (!product) {
          const error = new Error(
            "One or more products are unavailable"
          );
          error.statusCode = 400;
          error.code = "PRODUCT_UNAVAILABLE";
          throw error;
        }

        if (cartItem.quantity > product.stock) {
          const error = new Error(
            `Insufficient stock for ${product.name}`
          );
          error.statusCode = 400;
          error.code = "INSUFFICIENT_STOCK";
          throw error;
        }

        const itemTotal =
          product.price * cartItem.quantity;

        subtotal += itemTotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: cartItem.quantity
        });
      }

      const total = subtotal + SHIPPING_COST;

      const [order] = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            shippingAddress: {
              fullName:
                req.body.shippingAddress.fullName.trim(),
              phone:
                req.body.shippingAddress.phone.trim(),
              addressLine:
                req.body.shippingAddress.addressLine.trim(),
              city:
                req.body.shippingAddress.city.trim(),
              state:
                req.body.shippingAddress.state.trim(),
              postalCode:
                req.body.shippingAddress.postalCode.trim(),
              country:
                req.body.shippingAddress.country.trim()
            },
            subtotal,
            shippingCost: SHIPPING_COST,
            total,
            paymentStatus: "pending",
            orderStatus: "pending"
          }
        ],
        { session }
      );

      for (const cartItem of cart.items) {
        const result = await Product.updateOne(
          {
            _id: cartItem.product,
            isActive: true,
            stock: { $gte: cartItem.quantity }
          },
          {
            $inc: {
              stock: -cartItem.quantity
            }
          },
          { session }
        );

        if (result.modifiedCount !== 1) {
          const error = new Error(
            "Stock changed while creating the order. Please try again."
          );
          error.statusCode = 409;
          error.code = "STOCK_CHANGED";
          throw error;
        }
      }

      cart.items = [];
      await cart.save({ session });

      createdOrder = order;
    });

    const populatedOrder = await Order.findById(
      createdOrder._id
    )
      .populate("items.product", "name slug images")
      .lean();

    return res.status(201).json({
      success: true,
      data: populatedOrder
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      user: req.user._id
    })
      .populate("items.product", "name slug images")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid order ID",
          code: "INVALID_ORDER_ID"
        }
      });
    }

    const order = await Order.findOne({
      _id: id,
      user: req.user._id
    })
      .populate("items.product", "name slug images")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Order not found",
          code: "ORDER_NOT_FOUND"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid order ID",
          code: "INVALID_ORDER_ID"
        }
      });
    }

    let cancelledOrder;

    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: id,
        user: req.user._id
      }).session(session);

      if (!order) {
        const error = new Error("Order not found");
        error.statusCode = 404;
        error.code = "ORDER_NOT_FOUND";
        throw error;
      }

      if (
        !["pending", "confirmed", "processing"].includes(
          order.orderStatus
        )
      ) {
        const error = new Error(
          `Order cannot be cancelled when status is ${order.orderStatus}`
        );
        error.statusCode = 400;
        error.code = "ORDER_CANNOT_BE_CANCELLED";
        throw error;
      }

      for (const item of order.items) {
        await Product.updateOne(
          {
            _id: item.product
          },
          {
            $inc: {
              stock: item.quantity
            }
          },
          { session }
        );
      }

      order.orderStatus = "cancelled";

      await order.save({ session });

      cancelledOrder = order;
    });

    return res.status(200).json({
      success: true,
      data: cancelledOrder
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name slug")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid order ID",
          code: "INVALID_ORDER_ID"
        }
      });
    }

    if (
      ![
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
      ].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid order status",
          code: "INVALID_ORDER_STATUS"
        }
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Order not found",
          code: "ORDER_NOT_FOUND"
        }
      });
    }

    if (order.orderStatus === status) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Order already has this status",
          code: "STATUS_UNCHANGED"
        }
      });
    }

    const allowedTransitions =
      ORDER_STATUS_TRANSITIONS[order.orderStatus];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Order cannot move from ${order.orderStatus} to ${status}`,
          code: "INVALID_STATUS_TRANSITION"
        }
      });
    }

    if (status === "cancelled") {
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const currentOrder = await Order.findById(id).session(
            session
          );

          if (!currentOrder) {
            const error = new Error("Order not found");
            error.statusCode = 404;
            error.code = "ORDER_NOT_FOUND";
            throw error;
          }

          if (
            !ORDER_STATUS_TRANSITIONS[
              currentOrder.orderStatus
            ].includes("cancelled")
          ) {
            const error = new Error(
              "Order can no longer be cancelled"
            );
            error.statusCode = 400;
            error.code = "ORDER_CANNOT_BE_CANCELLED";
            throw error;
          }

          for (const item of currentOrder.items) {
            await Product.updateOne(
              { _id: item.product },
              {
                $inc: {
                  stock: item.quantity
                }
              },
              { session }
            );
          }

          currentOrder.orderStatus = "cancelled";

          await currentOrder.save({ session });
        });
      } finally {
        await session.endSession();
      }
    } else {
      order.orderStatus = status;
      await order.save();
    }

    const updatedOrder = await Order.findById(id)
      .populate("user", "name email")
      .populate("items.product", "name slug")
      .lean();

    return res.status(200).json({
      success: true,
      data: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};