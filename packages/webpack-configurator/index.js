// @flow

const { aliases } = require("./aliases");

const rxPathMapping = require("rxjs/_esm5/path-mapping");
const rxAliases = rxPathMapping();

const path = require("path");

// We will follow the next.js universal webpack configuration signature
// https://zeit.co/blog/next5#universal-webpack-and-next-plugins

/*::
type NextWebPackOptions = {
  dev: boolean,
  isServer: boolean
}

type WebpackConfig = {
  resolve?: {
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
  options /*: ?NextWebPackOptions */
) /*: WebpackConfig */ {
  // non-next.js app assumptions
  if (!options) {
    options = {
      dev: true,
      isServer: false
    };
  }

  const { dev, isServer } = options;

  if (!config.module) {
    config.module = {
      rules: []
    };
  }

  if (!config.module.rules) {
    config.module.rules = [];
  }

  const exclude = /node_modules\/(?!(@nteract|rx-jupyter|rx-binder|ansi-to-react|enchannel-zmq-backend|fs-observable))/;

  config.module.rules = config.module.rules.map(rule => {
    if (String(rule.exclude) === String(/node_modules/)) {
      rule.exclude = exclude;
    }
    return rule;
  });

  config.module.rules.push({
    test: /\.js$/,
    exclude,
    loader: "babel-loader"
  });

  config.module.rules.push({ test: /\.json$/, loader: "json-loader" });

  if (!config.resolve) {
    config.resolve = {};
  }

  config.resolve.alias = {
    // Whatever came in before
    ...config.resolve.alias,
    // Alias nteract packages
    ...aliases,
    // Alias RxJS modules
    ...rxAliases
  };

  config.resolve.mainFields = ["nteractDesktop", "module", "main"];
  config.resolve.extensions = [".js", ".jsx", ".json"];

  return config;
}

module.exports = {
  webpack
};
