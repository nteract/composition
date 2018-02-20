// @flow

// Since this has to be loaded at the stage of use by webpack and won't be
// transpiled, all flow in this file uses the "comment style".

const path = require("path");

const rxAliases /* : {[string]: string } */ = require("rxjs/_esm5/path-mapping")();
const { aliases } = require("./aliases");

// We will follow the next.js universal webpack configuration signature
// https://zeit.co/blog/next5#universal-webpack-and-next-plugins

/*::
type NextWebPackOptions = {
  dev: boolean,
  isServer: boolean
}

// Semi-hokey webpack type just to have some localized semi-sanity
type WebpackConfig = {
  resolve?: {
    mainFields?: Array<string>,
    extensions?: Array<string>,
    alias?: { [string]: string }
  },
  module: {
    rules: Array<{
      test: RegExp,
      exclude?: RegExp,
      loader?: string,
      use?: { loader?: string, options?: Object } | "string" | Array<*>
    }>
  }
};
 */

function webpack(
  config /*: WebpackConfig */,
  options /*: ?NextWebPackOptions */
) /*: WebpackConfig */ {
  // non-next.js app assumptions, that we're in dev mode and not server side
  // we're not using these yet, I'd like defaults set to keep a convention
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

  // We don't transpile packages in node_modules, unless it's _our_ package
  // Also don't transpile @nteract/plotly because it's plotly and massive
  const exclude = /node_modules\/(?!(@nteract\/(?!plotly)|rx-jupyter|rx-binder|ansi-to-react|enchannel-zmq-backend|fs-observable))/;

  // The JSON loader can't be loaded twice, so we check if they've already
  // configured it. If not, we'll set up the JSON loader after.
  // See https://github.com/webpack-contrib/json-loader/issues/13#issuecomment-188480384
  let hasJSONLoader = false;

  let hasBabelLoader = false;

  // If, for example, the webpack config was set up for hot reload, we override
  // it to accept nteract packages
  config.module.rules = config.module.rules.map(rule => {
    if (rule.loader === "json-loader") {
      hasJSONLoader = true;
    }

    if (
      rule.loader === "babel-loader" ||
      (rule.use && rule.use.loader === "babel-loader")
    ) {
      hasBabelLoader = true;
    }

    if (String(rule.exclude) === String(/node_modules/)) {
      rule.exclude = exclude;
    }

    return rule;
  });

  // ** Enforce transpilation **
  // At least for next.js apps, it seems like we still have to add this on.
  // We do know, based on hasBabelLoader if it already was configured in the
  // suite of rules. I hope this isn't adding a second step.
  config.module.rules.push({
    test: /\.js$/,
    exclude,
    loader: "babel-loader?cacheDirectory=true"
  });

  if (!hasJSONLoader) {
    config.module.rules.push({ test: /\.json$/, loader: "json-loader" });
  }

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

  config.resolve.mainFields = [
    "nteractDesktop",
    "es2015",
    "jsnext:main",
    "module",
    "main"
  ];
  config.resolve.extensions = [".js", ".jsx", ".json"];

  return config;
}

module.exports = {
  webpack
};
