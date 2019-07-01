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
        publicPath: "/nteract/static/dist/",
        hot: true,
        headers: { "Access-Control-Allow-Origin": "*" }
      },
  target: "web",
  output: {
    chunkFilename: isProd ? "[name]-[chunkhash].bundle.js" : "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
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
  resolve: {
    mainFields: ["nteractDesktop", "module", "main"],
    extensions: [".ts", ".tsx", ".js", ".css"],
    alias: configurator.mergeDefaultAliases()
  },
  plugins
};
