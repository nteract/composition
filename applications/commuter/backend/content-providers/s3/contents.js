// @flow

import type { $Request, $Response } from "express";

const express = require("express");

const { createS3Service } = require("./s3");

// TODO: typing here reflects what was put in place before, this could be
// more strict while letting flow do the work vs. the testing of common functions
const isDir = (path?: string | null) => !path || (path && path.endsWith("/"));

const errObject = (err, path) => ({
  message: `${err.message}: ${path}`,
  reason: err.code
});

// TODO: Flow type our config
function createRouter(config: Object): express.Router {
  const router = express.Router();
  const s3Service = createS3Service(config);

  router.get("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    const cb = (err, data) => {
      if (err) res.status(500).json(errObject(err, path));
      else res.json(data);
    };
    if (isDir(path)) s3Service.listObjects(path, cb);
    else {
      s3Service.getObject(path, (err, data) => {
        if (err && err.code === "NoSuchKey") {
          s3Service.listObjects(path.replace(/\/?$/, "/"), cb);
          return;
        }

        if (err) res.status(500).json(errObject(err, path));
        else res.json(data);
      });
    }
  });

  router.delete("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    const cb = err => {
      if (err) res.status(500).json(errObject(err, path));
      else res.status(204).send(); //as per jupyter contents api
    };
    if (isDir(path)) s3Service.deleteObjects(path, cb);
    else s3Service.deleteObject(path, cb);
  });

  router.post("/*", (req: $Request, res: $Response) => {
    const path = req.params["0"];
    const cb = err => {
      if (err) res.status(500).json(errObject(err, path));
      else res.status(201).send();
    };
    s3Service.uploadObject(path, req.body, cb);
  });

  return router;
}

export { createRouter, isDir };
