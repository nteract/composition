const validate = require("jsonschema").validate;

const nteractSchemas = require(".");

const validation = validate(
  require("./dummy.json"),
  nteractSchemas.notebook.metadata.nteract
);

const isaTTY = require("tty").isatty(1);

const passEmoji = {
  [true]: isaTTY ? "✅ " : "O",
  [false]: isaTTY ? "❌ " : "X"
};

const passed = validation.errors.length === 0;

console.log(`${passEmoji[passed]}`);

if (!passed) {
  console.error(validation.errors);
}
