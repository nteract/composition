// @flow

import type { $Request, $Response } from "express";

const express = require("express");

const { createDiscoveryService } = require("./elasticSearch");

function createDiscoveryRouter(discoveryOptions: Object) {
  const discoveryService = createDiscoveryService(
    discoveryOptions.elasticsearch
  );

  const router = express.Router();
  router.get("/*", (req: $Request, res: $Response) => {
    const successCb = data => res.json(data);

    const errorCb = err =>
      res.status(err.statusCode).json({ message: err.message });

    discoveryService.list(successCb, errorCb);
  });
  return router;
}

export { createDiscoveryRouter };
