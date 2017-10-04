const webpack = require("webpack");
const merge = require("webpack-merge");

const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

const { commonMainConfig, commonRendererConfig } = require("./webpack.common");

const plugins = [
  new webpack.optimize.ModuleConcatenationPlugin(),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("production")
  }),
  new UglifyJSPlugin({
    parallel: true,
    uglifyOptions: {
      ecma: 7
    }
  })
];

const mainConfig = merge(commonMainConfig, { plugins: plugins });

const rendererConfig = merge(commonRendererConfig, {
  plugins: [new LodashModuleReplacementPlugin(), ...plugins]
});

module.exports = [mainConfig, rendererConfig];
