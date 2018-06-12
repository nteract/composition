const webpack = require("webpack");
const path = require("path");

const nodeModules = {
  jmp: "commonjs jmp",
  canvas: "commonjs canvas",
  "canvas-prebuilt": "commonjs canvas-prebuilt"
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
    rules: [{ test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }]
  },
  resolve: {
    mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
    extensions: [".js", ".jsx"]
  },
  plugins: [new webpack.IgnorePlugin(/\.(css|less)$/)]
};

const rendererConfig = {
  mode: "development",
  entry: {
    app: "./src/notebook/index.js"
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
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.css$/, use: ["style-loader", "css-loader"] },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
    extensions: [".js", ".jsx"]
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
