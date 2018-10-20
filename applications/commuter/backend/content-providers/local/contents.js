// @flow
const express = require("express");

const fs = require("./fs");

import type { DiskProviderOptions } from "./fs";

import type { $Request, $Response } from "express";

type ErrorResponse = {
  message: string
};

export function createRouter(options: DiskProviderOptions) {
  if (!options.local.baseDirectory) {
    throw new Error("Base directory must be specified for the local provider");
  }
  const router = express.Router();
  router.get("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    fs.get(options, path)
      .then(content => {
        res.json(content);
      })
      .catch((err: ErrnoError) => {
        const errorResponse: ErrorResponse = {
          message: `${err.message}: ${path}`
        };

        if (err.code === "ENOENT") {
          res.status(404).json(errorResponse);
          return;
        }
        if (err.code === "EACCES") {
          // When unable to access a file, assume 404 in the GitHub security style
          // Even though we're providing all the information in the response...
          res.status(404).json(errorResponse);
          return;
        }

        res.status(500).json(errorResponse);
      });
  });
  router.post("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    fs.post(options, path, req.body)
      .then(() => res.status(201).send())
      .catch((err: ErrnoError) => {
        const errorResponse: ErrorResponse = {
          message: `${err.message}: ${path}`
        };
        res.status(500).json(errorResponse);
      });
  });
  return router;
}
