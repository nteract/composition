const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const nodeModules = {
  zmq: "commonjs zmq",
  jmp: "commonjs jmp",
  github: "commonjs github",
  canvas: "commonjs canvas"
};

module.exports = {
  entry: {
    app: "./src/notebook/index.js",
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
  target: "electron-renderer",
  output: {
    path: path.join(__dirname, "lib"),
    filename: "webpacked-notebook.js"
  },
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.json$/, loader: "json-loader" }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "main"],
    extensions: [".js", ".jsx"]
  },
  externals: nodeModules,
  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.IgnorePlugin(/\.(css|less)$/),

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
