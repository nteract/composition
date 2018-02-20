// @flow
const { lernaModules } = require("./monorepo");

const ignored = new Set([
  // we don't reuse the desktop app as a library
  "nteract",

  // commuter frontend is a next app, will actually rely on this package
  "@nteract/commuter-frontend",

  // TODO: Is there a possible way to make this get built by webpack?
  "@nteract/styles",

  // self, obviously we should skip ourselves
  "@nteract/webpack-configurator",

  // Just a note that we _will_ resolve the direct src of commuter the server
  // app since we it gets transpiled in the same way as our other packages
  // "@nteract/commuter",

  // These are all next.js apps and will rely on this package
  "@nteract/notebook-on-next",
  "@nteract/play",
  "@nteract/showcase",

  // The jupyter extension will rely on this package
  "nteract-on-jupyter",
  // The nbextension is the metapackage (python bits) and isn't used by anything
  "@nteract/nbextension"
]);

const aliases = lernaModules
  // filter out the ignored modules
  .filter(pkg => !ignored.has(pkg.name))
  .reduce((all, pkg) => {
    // Set each alias as pointing in to the `src` directory
    // e.g. @nteract/markdown -> @nteract/markdown/src
    //
    // This enables us to be able to transpile from direct source in the webpack
    // run
    all[pkg.name] = `${pkg.name}/src`;
    return all;
  }, {});

module.exports = {
  aliases
};
