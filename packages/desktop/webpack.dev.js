const webpack = require("webpack");
const merge = require("webpack-merge");

const { commonMainConfig, commonRendererConfig } = require("./webpack.common");

const rendererConfig = merge(commonRendererConfig, {
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
});

module.exports = [commonMainConfig, rendererConfig];
