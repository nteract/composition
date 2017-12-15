// @flow

import type { $Request, $Response } from "express";

const express = require("express"),
  path = require("path");

const createAPIRouter = require("./api");

function createRouter(config): express.Router {
  let contentsProvider;
  let discoveryProvider;

  switch (config.storageBackend) {
    case "s3":
      contentsProvider = require("../content-providers/s3");
      break;
    case "local":
    default:
      contentsProvider = require("../content-providers/local");
  }

  switch (config.discoveryBackend) {
    case "elasticsearch":
      // we only provide the elasticsearch storage currently
      discoveryProvider = require("../discovery-providers/elasticsearch");
      break;
    // Otherwise, we provide a dummy router for now
    default:
      discoveryProvider = require("../discovery-providers/none");
  }
  const apiRouter = createAPIRouter({
    contents: contentsProvider.createContentsRouter(config.storage),
    discovery: discoveryProvider.createDiscoveryRouter(config.discovery)
  });

  const router = express.Router();

  router.use("/api", apiRouter);
  router.use("/files", contentsProvider.createFilesRouter(config.storage));

  return router;
}

// Keeping the singleton on the export to make it work in-place right now
module.exports = createRouter(require("../config"));
