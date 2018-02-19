// @flow
const nteractConfigurator = require("@nteract/webpack-configurator");

const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

const config = {
  devtool: isProd ? "hidden-source-map" : "cheap-eval-source-map",
  module: { rules: [] },
  entry: {
    app: "./app/index.js",
    vendor: [
      "react",
      "react-dom",
      "react-redux",
      "redux",
      "redux-observable",
      "immutable",
      "rxjs",
      "jquery"
    ]
  },
  target: "web",
  output: {
    path: path.join(__dirname, "lib"),
    filename: "main.js"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(nodeEnv)
      }
    }),
    new webpack.HashedModuleIdsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.IgnorePlugin(/\.(css|less)$/),

    // build vendor bundle (including common code chunks used in other bundles)
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      minChunks: Infinity,
      filename: "vendor.js"
    }),
    new webpack.optimize.UglifyJsPlugin({
      mangle: false,
      compress: {
        warnings: false,
        pure_getters: true,
        passes: 3,
        screw_ie8: true,
        sequences: false
      },
      output: { comments: false, beautify: true },
      sourceMap: false
    }),

    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
};

module.exports = nteractConfigurator.webpack(config);
