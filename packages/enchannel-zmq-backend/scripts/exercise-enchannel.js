// @format
/**
 *
 * This script is intended to be run at the base of enchannel-zmq-backend
 * to perform a bit of a functional/integration test against a real, live kernel.
 *
 * It does _not_ have any actual test checks though and is solely intended to
 * be run manually.
 *
 * You can run this directly by running

     node scripts/exercise-enchannel.js

 * at the base of this package.
 *
 */
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
