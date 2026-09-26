const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const routes = require("./routes");
const notFound = require("./middleware/notFound.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(helmet());

// app.use(
//   cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true
//   })
// );

// for now we are allowing all origins, because our clinent is not ready yet
app.use(
  cors({
    origin: "*"
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;