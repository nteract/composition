// @flow

const express = require("express"),
  s3Proxy = require("s3-proxy");

// TODO: Flow type config
export function createRouter(config: Object): express.Router {
  const router = express.Router();

  router.get(
    "/*",
    s3Proxy({
      bucket: config.s3.params.Bucket,
      prefix: config.s3BasePrefix,
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
      overrideCacheControl: "max-age=100000"
    })
  );
  return router;
}
