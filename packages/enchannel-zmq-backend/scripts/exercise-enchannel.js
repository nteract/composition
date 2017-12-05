// @format
var { launch } = require("spawnteract");

var { unlink } = require("fs");

var { createMainChannel } = require("..");

var { first } = require("rxjs/operators");

var { executeRequest } = require("@nteract/messaging");

const uuid = require("uuid");

async function main() {
  var identity = uuid();
  const kernel = await launch("python3");

  const channel = createMainChannel(kernel.config);
  const message = executeRequest('print("woo")');
  console.log(message);

  channel.subscribe(console.log);
  channel.next(message);

  await new Promise(resolve => setTimeout(resolve, 1000));

  kernel.spawn.kill("SIGKILL");

  await new Promise((resolve, reject) =>
    unlink(kernel.connectionFile, err => (err ? reject(err) : resolve()))
  );
}

main()
  .then(x => console.log(x))
  .catch(err => console.error("main errored", err));
