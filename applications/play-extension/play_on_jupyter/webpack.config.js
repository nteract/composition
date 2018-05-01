// @flow

const configurator = require("@nteract/webpack-configurator");

const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

module.exports = {
  mode: isProd ? "production" : "development",
  devtool: isProd ? "hidden-source-map" : "cheap-eval-source-map",
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
    filename: "[name].js",
    chunkFilename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: configurator.exclude,
        loader: "babel-loader"
      }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "module", "main"],
    extensions: [".js", ".jsx"],
    alias: configurator.mergeDefaultAliases()
  },
  plugins: [
    new webpack.HashedModuleIdsPlugin(),

    new webpack.IgnorePlugin(/\.(css|less)$/),

    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
};
