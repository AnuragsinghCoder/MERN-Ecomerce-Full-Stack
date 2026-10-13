const mongoose = require("mongoose");
const Category = require("../models/Category");

function makeSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    error: { message },
  });
}

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select("name slug description images")
      .sort({ name: 1 })
      .lean();

    return res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

exports.getAllCategoriesForAdmin = async (req, res, next) => {
  try {
    const categories = await Category.find()
      .sort({ name: 1 })
      .lean();

    return res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

exports.createCategory = async (req, res, next) => {
  try {
    const name =
      typeof req.body.name === "string" ? req.body.name.trim() : "";

    const description =
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "";

    const images =
        typeof req.body.images === "string"
            ? [req.body.images.trim()].filter(Boolean)
            : Array.isArray(req.body.images)
            ? req.body.images
                .filter((image) => typeof image === "string")
                .map((image) => image.trim())
                .filter(Boolean)
        : [];
    if (name.length < 2 || name.length > 80) {
      return sendError(
        res,
        400,
        "Category name must be between 2 and 80 characters."
      );
    }

    if (description.length > 500) {
      return sendError(res, 400, "Description cannot exceed 500 characters.");
    }

    const slug = makeSlug(name);

    if (!slug) {
      return sendError(res, 400, "Enter a valid category name.");
    }

    const category = await Category.create({
      name,
      slug,
      description,
      images,
    });

    return res.status(201).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(
        res,
        409,
        "A category with this name or slug already exists."
      );
    }

    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid category ID.");
    }

    const updates = {};

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string") {
        return sendError(res, 400, "Category name must be a string.");
      }

      const name = req.body.name.trim();

      if (name.length < 2 || name.length > 80) {
        return sendError(
          res,
          400,
          "Category name must be between 2 and 80 characters."
        );
      }

      updates.name = name;
      updates.slug = makeSlug(name);
    }

    if (req.body.description !== undefined) {
      if (
        typeof req.body.description !== "string" ||
        req.body.description.trim().length > 500
      ) {
        return sendError(res, 400, "Invalid category description.");
      }

      updates.description = req.body.description.trim();
    }

    if (updates.images !== undefined) {
      if (req.body.images !== undefined) {
        if (
          !Array.isArray(req.body.images) ||
          req.body.images.some(
            (image) =>
              typeof image !== "string" ||
              image.trim().length === 0 ||
              image.trim().length > 500
          )
        ) {
          return sendError(res, 400, "Invalid category images.");
        }

        updates.images = req.body.images.map((image) => image.trim());
      }
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, "Provide a category name or description or images.");
    }

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return sendError(res, 404, "Category not found.");
    }

    return res.json({ success: true, data: { category } });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 409, "A category with this slug already exists.");
    }

    if (error.name === "ValidationError") {
      return sendError(res, 400, error.message);
    }

    next(error);
  }
};

exports.deactivateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid category ID.");
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendError(res, 404, "Category not found.");
    }

    return res.json({
      success: true,
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};