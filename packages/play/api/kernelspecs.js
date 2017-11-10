const express = require("express"),
  path = require("path"),
  bodyParser = require("body-parser");

function create() {
  const router = express.Router();

  router.get("/kernelspecs", (req, res) => {
    res.json({ metadata: {} });
  });

  return router;
}

module.exports = {
  create
};
