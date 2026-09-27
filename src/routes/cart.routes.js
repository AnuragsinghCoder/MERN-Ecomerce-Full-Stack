const express = require("express");

const {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeProductFromCart,
  clearCart
} = require("../controllers/cart.controller");

const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getCart);

router.post("/items", addProductToCart);

router.put("/items/:productId", updateCartItemQuantity);

router.delete("/items/:productId", removeProductFromCart);

router.delete("/", clearCart);

module.exports = router;