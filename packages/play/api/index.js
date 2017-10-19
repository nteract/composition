const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser");

const defaultContentTypeMiddleware = (req, res, next) => {
  req.headers["content-type"] =
    req.headers["content-type"] || "application/json";
  next();
};

const kernelspecs = require("./kernelspecs");

function createAPIRouter() {
  const router = express.Router();
  router.use(defaultContentTypeMiddleware);
  router.use(bodyParser.json({ limit: "50mb" })); //50mb is the current threshold
  router.use(bodyParser.urlencoded({ extended: true }));

  router.use("/ping", (req, res) => {
    res.json({ message: "pong" });
  });

  router.use(kernelspecs.create());

  return router;
}

module.exports = createAPIRouter;
