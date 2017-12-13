var path = require("path");
var spawn = require("child_process").spawn;

delete process.env.ELECTRON_RUN_AS_NODE;
var args = process.argv.slice(2);
if (process.env.NTERACT_DIR) {
  args.unshift(process.env.NTERACT_DIR);
}

var options = { detached: true, stdio: "ignore" };
spawn(process.env.NTERACT_EXE, args, options);
process.exit(0);
