// @flow

const { aliases } = require("./aliases");

const rxPathMapping = require("rxjs/_esm5/path-mapping");
const rxAliases = rxPathMapping();

// We will follow the next.js universal webpack configuration signature
// https://zeit.co/blog/next5#universal-webpack-and-next-plugins

/*::
type NextWebPackOptions = {
  dev: boolean,
  isServer: boolean
}

type WebpackConfig = {
  resolve: {
    mainFields?: Array<string>,
    extensions?: Array<string>,
    alias?: { [string]: string }
  },
  module: {
    rules: Array<{ test: RegExp, exclude?: RegExp, loader: string }>
  }
};
 */

function webpack(
  config /*: WebpackConfig */,
  options /*: NextWebPackOptions */
) /*: WebpackConfig */ {
  if (!config.module) {
    config.module = {};
  }
  if (!config.module.rules) {
    config.module.rules = [];
  }

  config.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules\/(?!(@nteract|rx-jupyter|rx-binder|ansi-to-react|enchannel-zmq-backend|fs-observable))/,
    loader: "babel-loader"
  });
  config.module.rules.push({ test: /\.json$/, loader: "json-loader" });

  if (!config.resolve) {
    config.resolve = {};
  }

  config.resolve.alias = {
    // Alias nteract packages
    ...aliases,
    // Alias RxJS modules
    ...rxAliases
  };

  config.resolve.mainFields = ["nteractDesktop", "module", "main"];
  config.resolve.extensions = [".js", ".jsx"];

  return config;
}

module.exports = {
  webpack
};
