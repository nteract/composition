// @format
var { launch } = require("spawnteract");

var { unlink } = require("fs");

var { createMainChannel } = require("..");

var { first, take, toArray, takeUntil } = require("rxjs/operators");

var { executeRequest, ofMessageType } = require("@nteract/messaging");

const uuid = require("uuid");

async function main() {
  var identity = uuid();
  const kernel = await launch("python3");

  const channel = createMainChannel(kernel.config);
  const message = executeRequest('print("woo")');
  console.log(message);

  const p = channel
    .pipe(
      take(3),

      toArray()
    )
    .toPromise();

  channel.next(message);

  const messages = await p;

  console.log(messages);

  kernel.spawn.kill("SIGKILL");

  console.log("killing");

  await new Promise((resolve, reject) =>
    unlink(kernel.connectionFile, err => (err ? reject(err) : resolve()))
  );
  return "woo";
}

main()
  .then(x => console.log(x))
  .catch(err => console.error("main errored", err));
