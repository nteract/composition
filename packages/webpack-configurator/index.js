// @flow

// Since this has to be loaded at the stage of use by webpack and won't be
// transpiled, all flow in this file uses the "comment style".

const path = require("path");

/*::
opaque type Aliases = {[string]: string }
*/

const rxAliases /* : Aliases */ = require("rxjs/_esm5/path-mapping")();
const { aliases } = require("./aliases");

// We don't transpile packages in node_modules, unless it's _our_ package
// Also don't transpile @nteract/plotly because it's plotly and massive
// Explicitly ignore the typescript/lib in monaco, or everything fails
const exclude = /node_modules\/(?!(@nteract\/(?!plotly)|rx-jupyter|rx-binder|ansi-to-react|enchannel-zmq-backend|fs-observable))|vs\/language\/typescript\/lib/;

function mergeDefaultAliases(originalAlias /*: ?Aliases */) /*: Aliases */ {
  return {
    // Whatever came in before
    ...originalAlias,
    // Alias nteract packages
    ...aliases,
    // Alias RxJS modules
    ...rxAliases
  };
}

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

function nextWebpack(
  config /*: WebpackConfig */,
  options /*: ?NextWebPackOptions */
) /*: WebpackConfig */ {
  config.module.rules = config.module.rules.map(rule => {
    if (
      rule.test.source.includes("js") &&
      typeof rule.exclude !== "undefined"
    ) {
      rule.exclude = exclude;
    }

    return rule;
  });

  config.module.rules.push({
    test: /\.js$/,
    exclude: exclude,
    loader: "babel-loader"
  });

  config.resolve = Object.assign({}, config.resolve, {
    mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
    alias: mergeDefaultAliases(
      config.resolve ? config.resolve.alias : undefined
    )
  });
  return config;
}

module.exports = {
  exclude,
  aliases,
  mergeDefaultAliases,
  nextWebpack
};
