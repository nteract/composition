const path = require("path");

const webpack = require("webpack");
const configurator = require("@nteract/webpack-configurator");

const nodeModules = {
  jmp: "commonjs jmp",
  canvas: "commonjs canvas",
  "nteract-assets": "commonjs nteract-assets",
  "mathjax-electron": "commonjs mathjax-electron"
};

const mainConfig = {
  mode: "development",
  entry: {
    main: "./src/main/index.js"
  },
  target: "electron-main",
  output: {
    path: path.join(__dirname, "lib"),
    filename: "webpacked-main.js"
  },
  node: {
    __dirname: false,
    __filename: false
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
    mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
    extensions: [".js", ".jsx"],
    alias: configurator.mergeDefaultAliases()
  },
  plugins: [new webpack.IgnorePlugin(/\.(css|less)$/)]
};

const rendererConfig = {
  mode: "development",
  entry: {
    app: "./src/notebook/index.js",
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
  target: "electron-renderer",
  output: {
    path: path.join(__dirname, "lib"),
    chunkFilename: "[name].bundle.js",
    filename: "[name].js"
  },
  externals: nodeModules,
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
    // No external CSS should get side-loaded by js
    // I'm looking at you vega-tooltip
    new webpack.IgnorePlugin(/\.(css|less)$/)
  ]
};

module.exports = {
  commonMainConfig: mainConfig,
  commonRendererConfig: rendererConfig
};
