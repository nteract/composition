// @flow
const createServer = require("./server"),
  Log = require("log"),
  log = new Log("info");

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
