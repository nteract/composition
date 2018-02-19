// @flow

const { aliases } = require("./aliases");

// We will follow the next.js universal webpack configuration signature
// https://zeit.co/blog/next5#universal-webpack-and-next-plugins

/*::
type NextWebPackOptions = {
  dev: boolean,
  isServer: boolean
}

type WebpackConfig = {
  module: {
    rules: Array<{ test: RegExp, exclude?: RegExp, loader: string }>
  }
};
 */

function webpack(
  config /*: WebpackConfig */,
  options /*: NextWebPackOptions */
) /*: WebpackConfig */ {
  config.module.rules.push({
    test: /\.js$/,
    exclude: /node_modules\/(?!(@nteract|rx-jupyter|rx-binder|ansi-to-react|enchannel-zmq-backend|fs-observable))/,
    loader: "babel-loader"
  });

  config.module.rules.push({ test: /\.json$/, loader: "json-loader" });

  return config;
}
