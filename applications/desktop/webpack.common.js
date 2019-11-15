const path = require("path");

const webpack = require("webpack");
const configurator = require("@nteract/webpack-configurator");

const nodeModules = {
  jmp: "commonjs jmp",
  canvas: "commonjs canvas",
  "canvas-prebuilt": "commonjs canvas-prebuilt",
  "nteract-assets": "commonjs nteract-assets",
  "mathjax-electron": "commonjs mathjax-electron",
  "@nteract/examples": "commonjs @nteract/examples"
};

const mainConfig = {
  mode: "development",
  entry: {
    main: "./src/main/index.ts"
  },
  target: "electron-main",
  output: {
    path: path.join(__dirname, "lib"),
    filename: "webpacked-main.js"
  },
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [configurator.tsLoaderConfig]
      }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: configurator.mergeDefaultAliases()
  },
  plugins: [new webpack.IgnorePlugin(/\.(css|less)$/)]
};

const rendererConfig = {
  mode: "development",
  entry: {
    app: "./src/notebook/index.tsx",
    preferences: "./src/preferences/index.tsx",
  },
  target: "electron-renderer",
  output: {
    path: path.join(__dirname, "lib"),
    chunkFilename: "[name].bundle.js",
    filename: "[name].js"
  },
  externals: nodeModules,
  node: {
    __dirname: false,
    __filename: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.tsx?$/,
        use: [configurator.tsLoaderConfig]
      },
      {
        test: /\.(jpg|png|gif)$/,
        use: "file-loader"
      }
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "module", "main"],
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: configurator.mergeDefaultAliases()
  },
  plugins: []
};

module.exports = {
  commonMainConfig: mainConfig,
  commonRendererConfig: rendererConfig
};
