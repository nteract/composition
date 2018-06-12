const webpack = require("webpack");
const merge = require("webpack-merge");

const { commonMainConfig, commonRendererConfig } = require("./webpack.common");

const rendererConfig = merge(commonRendererConfig, {
  entry: {
    vendor: [
      "react",
      "react-dnd",
      "react-dnd-html5-backend",
      "react-dom",
      "react-redux",
      "redux",
      "redux-logger",
      "redux-observable",
      "immutable",
      "rxjs",
      "date-fns"
    ]
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
});

module.exports = [commonMainConfig, rendererConfig];
