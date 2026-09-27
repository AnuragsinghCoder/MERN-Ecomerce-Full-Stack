const jwt = require("jsonwebtoken");

const User = require("../models/User");

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication required",
          code: "AUTHENTICATION_REQUIRED"
        }
      });
    }

    const token = authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication token is missing",
          code: "TOKEN_MISSING"
        }
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: "User no longer exists",
          code: "USER_NOT_FOUND"
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

    req.user = user;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: {
          message: "Invalid authentication token",
          code: "INVALID_TOKEN"
        }
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: {
          message: "Authentication token has expired",
          code: "TOKEN_EXPIRED"
        }
      });
    }

    next(error);
  }
};

const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        message: "Authentication required",
        code: "AUTHENTICATION_REQUIRED"
      }
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: {
        message: "Admin access required",
        code: "ADMIN_ACCESS_REQUIRED"
      }
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorizeAdmin
};