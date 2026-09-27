const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/product.controller");

const {
  authenticate,
  authorizeAdmin
} = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin routes
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createProduct
);

router.put(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteProduct
);

module.exports = router;