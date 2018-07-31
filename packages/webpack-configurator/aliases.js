// @flow
const { lernaModules } = require("./monorepo");

const ignored = new Set([
  // we don't reuse the desktop app as a library
  "nteract",

  // commuter is a next app -- if people need modules from it, they should be
  // made into new packages
  "@nteract/commuter",
  // Deprecated frontend package (it's part of commuter itself now)
  "@nteract/commuter-frontend",

  // TODO: Is there a possible way to make this get built by webpack?
  "@nteract/styles",

  // self, obviously we should skip ourselves
  "@nteract/webpack-configurator",

  // "@nteract/commuter",

  // These are all next.js apps and will rely on this package
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
