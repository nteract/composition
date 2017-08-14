const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

module.exports = {
  entry: {
    app: "./index.js",
    vendor: [
      "react",
      "react-dnd",
      "react-dnd-html5-backend",
      "react-dom",
      "react-redux",
      "react-simple-dropdown",
      "redux",
      "redux-logger",
      "redux-observable",
      "immutable",
      "rxjs",
      "codemirror",
      "commonmark",
      "commonmark-react-renderer",
      "date-fns"
    ]
  },
  target: "web",
  output: {
    path: path.join(__dirname, "lib"),
    filename: "main.js"
  },
  module: {
    rules: [
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.json$/, loader: "json-loader" }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "main"],
    extensions: [".js", ".jsx"]
  },
  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),

    // new webpack.IgnorePlugin(/\.(css|less)$/),

    // build vendor bundle (including common code chunks used in other bundles)
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js"
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    })
  ]
};
