const mongoose = require("mongoose");

const Cart = require("../models/Cart");
const Product = require("../models/Product");

const getCartWithProducts = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: []
    });
  }

  await cart.populate({
    path: "items.product",
    select: "name slug price stock images isActive"
  });

  return cart;
};

const calculateCartTotal = (cart) => {
  return cart.items.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);
};

const formatCartResponse = (cart) => {
  return {
    _id: cart._id,
    user: cart.user,
    items: cart.items,
    totalItems: cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    ),
    totalAmount: calculateCartTotal(cart),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt
  };
};

const getCart = async (req, res, next) => {
  try {
    const cart = await getCartWithProducts(req.user._id);

    return res.status(200).json({
      success: true,
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

const addProductToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Product ID is required",
          code: "PRODUCT_ID_REQUIRED"
        }
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID",
          code: "INVALID_PRODUCT_ID"
        }
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Quantity must be a positive integer",
          code: "INVALID_QUANTITY"
        }
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found or unavailable",
          code: "PRODUCT_UNAVAILABLE"
        }
      });
    }

    let cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    const newQuantity = existingItem
      ? existingItem.quantity + quantity
      : quantity;

    if (newQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Only ${product.stock} units are available`,
          code: "INSUFFICIENT_STOCK"
        }
      });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      cart.items.push({
        product: product._id,
        quantity
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price stock images isActive"
    });

    return res.status(200).json({
      success: true,
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID",
          code: "INVALID_PRODUCT_ID"
        }
      });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Quantity must be a positive integer",
          code: "INVALID_QUANTITY"
        }
      });
    }

    const product = await Product.findOne({
      _id: productId,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found or unavailable",
          code: "PRODUCT_UNAVAILABLE"
        }
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        error: {
          message: `Only ${product.stock} units are available`,
          code: "INSUFFICIENT_STOCK"
        }
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Cart not found",
          code: "CART_NOT_FOUND"
        }
      });
    }

    const item = cart.items.find(
      (cartItem) => cartItem.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product is not in the cart",
          code: "CART_ITEM_NOT_FOUND"
        }
      });
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price stock images isActive"
    });

    return res.status(200).json({
      success: true,
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

const removeProductFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID",
          code: "INVALID_PRODUCT_ID"
        }
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Cart not found",
          code: "CART_NOT_FOUND"
        }
      });
    }

    const originalLength = cart.items.length;

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    if (cart.items.length === originalLength) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product is not in the cart",
          code: "CART_ITEM_NOT_FOUND"
        }
      });
    }

    await cart.save();

    await cart.populate({
      path: "items.product",
      select: "name slug price stock images isActive"
    });

    return res.status(200).json({
      success: true,
      data: formatCartResponse(cart)
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({
      user: req.user._id
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: {
          message: "Cart is already empty"
        }
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      success: true,
      data: {
        message: "Cart cleared successfully"
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addProductToCart,
  updateCartItemQuantity,
  removeProductFromCart,
  clearCart
};