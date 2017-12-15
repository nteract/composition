// @flow
const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser");

import type { Middleware, $Request, $Response } from "express";

const defaultContentTypeMiddleware: Middleware = (
  req: $Request,
  res: $Response,
  next
) => {
  req.headers["content-type"] =
    req.headers["content-type"] || "application/json";
  next();
};

type APIRouters = {
  contents: express.Router,
  discovery: express.Router
};

function createAPIRouter(api: APIRouters): express.Router {
  const router = express.Router();
  router.use(defaultContentTypeMiddleware);
  router.use(bodyParser.json({ limit: "50mb" })); //50mb is the current threshold
  router.use(bodyParser.urlencoded({ extended: true }));

  router.use("/ping", (req: $Request, res: $Response) => {
    res.json({ message: "pong" });
  });

  router.use("/contents", api.contents);
  router.use("/v1/discovery", api.discovery);
  return router;
}

module.exports = createAPIRouter;
