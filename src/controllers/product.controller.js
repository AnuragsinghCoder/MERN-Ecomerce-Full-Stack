const mongoose = require("mongoose");

const Product = require("../models/Product");
const Category = require("../models/Category");

const SORT_FIELDS = {
  price: "price",
  name: "name",
  createdAt: "createdAt"
};

const parsePagination = (page, limit) => {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  const currentPage =
    Number.isInteger(parsedPage) && parsedPage > 0
      ? parsedPage
      : 1;

  const itemsPerPage =
    Number.isInteger(parsedLimit) && parsedLimit > 0
      ? Math.min(parsedLimit, 50)
      : 10;

  return {
    page: currentPage,
    limit: itemsPerPage,
    skip: (currentPage - 1) * itemsPerPage
  };
};

const buildSort = (sort) => {
  if (!sort) {
    return { createdAt: -1 };
  }

  const descending = sort.startsWith("-");
  const fieldName = descending ? sort.slice(1) : sort;

  const field = SORT_FIELDS[fieldName];

  if (!field) {
    return { createdAt: -1 };
  }

  return {
    [field]: descending ? -1 : 1
  };
};

const getProducts = async (req, res, next) => {
  try {
    const {
      search,
      category,
      page,
      limit,
      sort
    } = req.query;

    const filter = {
      isActive: true
    };

    if (search && search.trim()) {
      filter.$text = {
        $search: search.trim()
      };
    }

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid category ID",
            code: "INVALID_CATEGORY_ID"
          }
        });
      }

      filter.category = category;
    }

    const pagination = parsePagination(page, limit);
    const sortOption = buildSort(sort);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select("-__v")
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),

      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
        hasNextPage: pagination.page < totalPages,
        hasPreviousPage: pagination.page > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID",
          code: "INVALID_PRODUCT_ID"
        }
      });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true
    })
      .select("-__v")
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

const validateProductData = async ({
  name,
  slug,
  description,
  price,
  category,
  stock,
  images
}) => {
  if (
    name === undefined ||
    slug === undefined ||
    description === undefined ||
    price === undefined ||
    category === undefined ||
    stock === undefined
  ) {
    return "name, slug, description, price, category, and stock are required";
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    return "Invalid category ID";
  }

  const categoryExists = await Category.exists({
    _id: category,
    isActive: true
  });

  if (!categoryExists) {
    return "Active category not found";
  }

  if (!Number.isInteger(price) || price < 0) {
    return "Price must be a non-negative integer in the smallest currency unit";
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return "Stock must be a non-negative integer";
  }

  if (images !== undefined && !Array.isArray(images)) {
    return "Images must be an array";
  }

  return null;
};

const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      category,
      stock,
      images
    } = req.body;

    const validationError = await validateProductData({
      name,
      slug,
      description,
      price,
      category,
      stock,
      images
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        error: {
          message: validationError,
          code: "VALIDATION_ERROR"
        }
      });
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      stock,
      images
    });

    const populatedProduct = await Product.findById(product._id)
      .select("-__v")
      .populate("category", "name slug")
      .lean();

    return res.status(201).json({
      success: true,
      data: populatedProduct
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];

      if (duplicateField === "slug") {
        return res.status(409).json({
          success: false,
          error: {
            message: "A product with this slug already exists",
            code: "PRODUCT_SLUG_ALREADY_EXISTS"
          }
        });
      }
    }

    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID",
          code: "INVALID_PRODUCT_ID"
        }
      });
    }

    const allowedFields = [
      "name",
      "slug",
      "description",
      "price",
      "category",
      "stock",
      "images",
      "isActive"
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "No valid product fields were provided",
          code: "NO_UPDATE_FIELDS"
        }
      });
    }

    if (updates.category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(updates.category)) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Invalid category ID",
            code: "INVALID_CATEGORY_ID"
          }
        });
      }

      const categoryExists = await Category.exists({
        _id: updates.category,
        isActive: true
      });

      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          error: {
            message: "Active category not found",
            code: "CATEGORY_NOT_FOUND"
          }
        });
      }
    }

    if (
      updates.price !== undefined &&
      (!Number.isInteger(updates.price) || updates.price < 0)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message:
            "Price must be a non-negative integer in the smallest currency unit",
          code: "INVALID_PRICE"
        }
      });
    }

    if (
      updates.stock !== undefined &&
      (!Number.isInteger(updates.stock) || updates.stock < 0)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Stock must be a non-negative integer",
          code: "INVALID_STOCK"
        }
      });
    }

    if (
      updates.images !== undefined &&
      !Array.isArray(updates.images)
    ) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Images must be an array",
          code: "INVALID_IMAGES"
        }
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true
      }
    )
      .select("-__v")
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: {
          message: "A product with this slug already exists",
          code: "PRODUCT_SLUG_ALREADY_EXISTS"
        }
      });
    }

    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Invalid product ID",
          code: "INVALID_PRODUCT_ID"
        }
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      {
        isActive: false
      },
      {
        new: true,
        runValidators: true
      }
    )
      .select("-__v")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: {
          message: "Product not found",
          code: "PRODUCT_NOT_FOUND"
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        message: "Product deleted successfully"
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};