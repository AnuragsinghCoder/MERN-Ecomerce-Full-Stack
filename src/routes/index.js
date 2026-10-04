const express = require("express");

const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const cartRoutes = require("./cart.routes");
const orderRoutes = require("./order.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/products", productRoutes);
router.use("/v1/cart", cartRoutes);
router.use("/v1/orders", orderRoutes);

module.exports = router;