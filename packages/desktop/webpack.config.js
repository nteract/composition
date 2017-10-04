const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const webpack = require("webpack");
const path = require("path");

const nodeModules = {
  jmp: "commonjs jmp",
  uuid: "commonjs uuid",
  github: "commonjs github",
  canvas: "commonjs canvas"
};

const options = {
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" },
      { test: /\.json$/, loader: "json-loader" },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
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
    mainFields: ["nteractDesktop", "jsnext:main", "main"],
    extensions: [".js", ".jsx"]
  }
};

const mainConfig = Object.assign({}, options, {
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
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.IgnorePlugin(/\.(css|less)$/)
  ]
});

const rendererConfig = Object.assign({}, options, {
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
  externals: nodeModules,
  plugins: [
    new LodashModuleReplacementPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),

    new webpack.IgnorePlugin(/\.less$/),

    // build vendor bundle (including common code chunks used in other bundles)
    new webpack.optimize.CommonsChunkPlugin({
      name: "vendor",
      filename: "vendor.js"
    }),
    new webpack.SourceMapDevToolPlugin({
      filename: "[name].js.map",
      exclude: ["vendor.js"]
    }),
    new ExtractTextPlugin("styles.css")
  ]
});

module.exports = [mainConfig, rendererConfig];
