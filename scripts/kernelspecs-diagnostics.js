#!/usr/bin/env node
require("kernelspecs")
  .findAll()
  .then(console.log.bind(console))
  .catch(console.error.bind(console));
