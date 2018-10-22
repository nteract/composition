// @flow
import type { $Request, $Response } from "express";

import type { DiskProviderOptions } from "./fs";

const fs = require("fs");
const path = require("path");

const express = require("express");

const sanitizeFilePath = require("./fs").sanitizeFilePath;

type ErrorResponse = {
  message: string
};

export function createRouter(options: DiskProviderOptions) {
  if (!options.local.baseDirectory) {
    throw new Error("Base directory must be specified for the local provider");
  }

  const router = express.Router();

  router.get("/*", (req: $Request, res: $Response) => {
    const unsafeFilePath = req.params["0"];

    const filePath = path.join(
      options.local.baseDirectory,
      sanitizeFilePath(unsafeFilePath)
    );

    // Assume it's a file by default, fall to error handling otherwise
    const rs = fs.createReadStream(filePath);

    rs.on("error", err => {
      const errorResponse: ErrorResponse = {
        message: `${err.message}: ${filePath}`
      };

      if (err.code === "ENOENT" || err.code === "EACCES") {
        res.status(404).send(errorResponse);
        return;
      }

      console.error(err.stack);
      res.status(500).send(errorResponse);
    });

    rs.pipe(res);
  });
  return router;
}
