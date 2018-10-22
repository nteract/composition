// @flow
import type { Middleware, $Request, $Response } from "express";

const express = require("express");
const bodyParser = require("body-parser");

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
