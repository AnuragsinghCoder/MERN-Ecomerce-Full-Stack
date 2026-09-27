const bcrypt = require("bcrypt");

const User = require("../models/User");
const generateToken = require("../utils/jwt");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  addresses: user.addresses,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Name, email, and password are required",
          code: "VALIDATION_ERROR"
        }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          message: "An account with this email already exists",
          code: "EMAIL_ALREADY_EXISTS"
        }
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: "customer"
    });

    const token = generateToken(user._id.toString());

    return res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(409).json({
        success: false,
        error: {
          message: "An account with this email already exists",
          code: "EMAIL_ALREADY_EXISTS"
        }
      });
    }

    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Email and password are required",
          code: "VALIDATION_ERROR"
        }
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail
    }).select("+passwordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS"
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          message: "User account is inactive",
          code: "ACCOUNT_INACTIVE"
        }
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid email or password",
          code: "INVALID_CREDENTIALS"
        }
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user)
    }
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  sanitizeUser
};