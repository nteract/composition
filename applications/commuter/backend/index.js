// @flow
const Log = require("log");

const createServer = require("./server");

const log = new Log("info");

createServer()
  .then(server => {
    const port = server.address().port;
    log.info("Commuter server listening on port " + port);
  })
  .catch((e: Error) => {
    console.error(e);
    console.error(e.stack);
    process.exit(-10);
  });
