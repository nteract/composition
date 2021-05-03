const path = require("path");

const configurator = require("@nteract/webpack-configurator");
const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const webpack = require("webpack");
const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");

const nodeEnv = process.env.NODE_ENV || "development";
const isProd = nodeEnv === "production";

const plugins = [
  new MonacoWebpackPlugin(),
  new webpack.IgnorePlugin(
    /^((fs)|(path)|(os)|(crypto)|(source-map-support))$/,
    /vs\/language\/typescript\/lib/
  )
];

if (isProd) {
  plugins.push(new LodashModuleReplacementPlugin());
} else {
  plugins.push(new webpack.HotModuleReplacementPlugin());
}

module.exports = {
  externals: ["canvas"],
  mode: isProd ? "production" : "development",
  devtool: isProd ? "hidden-source-map" : "cheap-eval-source-map",
  entry: {
    app: "./app/index.tsx"
  },
  devServer: isProd
    ? {}
    : {
        writeToDisk: true,
        publicPath: "/nteract/static/dist/",
        hot: true,
        headers: { "Access-Control-Allow-Origin": "*" }
      },
  target: "web",
  output: isProd
    ? {
        chunkFilename: "[name]-[chunkhash].bundle.js"
      }
    : {
        chunkFilename: "[name].bundle.js",
        path: path.resolve(__dirname, 'dist'),
        publicPath: "/nteract/static/dist/",
      },
  node: {
    fs: "empty"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(jpg|png|gif|svg)$/,
        use: "file-loader"
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"]
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              compilerOptions: {
                noEmit: false
              }
            }
          }
        ]
      }
    ]
  },
  watchOptions: {
    ignored: [
      /\/app\/node_modules\//
    ]
  },
  resolve: {
    mainFields: ["nteractDesktop", "module", "main"],
    extensions: [".ts", ".tsx", ".js"],
    alias: configurator.mergeDefaultAliases()
  },
  plugins
};
