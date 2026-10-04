const express = require("express");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/order.controller");

const {
  authenticate,
  authorizeAdmin
} = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

// Customer routes
router.post("/", createOrder);

router.get("/my-orders", getMyOrders);

router.get("/:id", getOrderById);

router.patch("/:id/cancel", cancelOrder);

// Admin routes
router.get(
  "/admin/all",
  authorizeAdmin,
  getAllOrders
);

router.patch(
  "/admin/:id/status",
  authorizeAdmin,
  updateOrderStatus
);

module.exports = router;