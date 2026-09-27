const notFound = require("./notFound.middleware");
const errorHandler = require("./error.middleware");

const {
  authenticate,
  authorizeAdmin
} = require("./auth.middleware");

module.exports = {
  notFound,
  errorHandler,
  authenticate,
  authorizeAdmin
};