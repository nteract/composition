// @format
var { launch } = require("spawnteract");

var { unlink } = require("fs");

var { createMainChannel } = require("..");

var { first } = require("rxjs/operators");

const uuid = require("uuid");

async function main() {
  var identity = uuid();
  const kernel = await launch("python3");

  const channel = createMainChannel(identity, kernel.config);
  const message = {
    header: {
      msg_id: `execute_9ed11a0f-707e-4f71-829c-a19b8ff8eed8`,
      username: "rgbkrk",
      session: "00000000-0000-0000-0000-000000000000",
      msg_type: "execute_request",
      version: "5.0"
    },
    content: {
      code: 'print("woo")',
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: false
    },
    channel: "shell"
  };
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
