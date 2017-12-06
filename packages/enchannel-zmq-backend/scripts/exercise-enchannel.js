// @format
var { launch } = require("spawnteract");

var { unlink } = require("fs");

var { createMainChannel } = require("..");

var { first, take, toArray, takeUntil, tap } = require("rxjs/operators");

var { executeRequest, ofMessageType } = require("@nteract/messaging");

const uuid = require("uuid");

async function main() {
  var identity = uuid();
  const kernel = await launch("python3");

  const channel = createMainChannel(kernel.config);
  const message = executeRequest('print("woo")');

  const subscription = channel.subscribe(console.log);

  channel.next(message);

  console.log("sleep 1");

  await new Promise(resolve => setTimeout(resolve, 1000));

  channel.next(message);

  console.log("sleep 2");
  await new Promise(resolve => setTimeout(resolve, 1000));

  kernel.spawn.kill("SIGKILL");
  subscription.unsubscribe();

  await new Promise((resolve, reject) =>
    unlink(kernel.connectionFile, err => (err ? reject(err) : resolve()))
  );
}

main()
  .then(x => console.log(x))
  .catch(err => console.error("main errored", err));
