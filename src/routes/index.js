const express = require("express");

const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const productRoutes = require("./product.routes");
const cartRoutes = require("./cart.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/products", productRoutes);
router.use("/v1/cart", cartRoutes);

module.exports = router;