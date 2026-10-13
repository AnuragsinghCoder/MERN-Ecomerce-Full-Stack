const express = require("express");
const {
  getCategories,
  getAllCategoriesForAdmin,
  createCategory,
  updateCategory,
  deactivateCategory,
} = require("../controllers/category.controller");

const { authenticate, authorizeAdmin } = require("../middleware");

const router = express.Router();

// Public: active categories only
router.get("/", getCategories);

// Admin-only routes must be registered before /:id.
router.get(
  "/admin/all",
  authenticate,
  authorizeAdmin,
  getAllCategoriesForAdmin
);

router.post("/", authenticate, authorizeAdmin, createCategory);
router.put("/:id", authenticate, authorizeAdmin, updateCategory);
router.delete("/:id", authenticate, authorizeAdmin, deactivateCategory);

module.exports = router;