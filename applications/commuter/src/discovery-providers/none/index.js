// @flow

import type { $Request, $Response } from "express";

const express = require("express");

function createDiscoveryRouter(options?: Object): express.Router {
  const router = express.Router();
  router.get("/*", (req: $Request, res: $Response) => {
    res.json({
      results: []
    });
  });
  return router;
}

module.exports = {
  createDiscoveryRouter
};
