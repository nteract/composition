const merge = require("webpack-merge");

const LodashModuleReplacementPlugin = require("lodash-webpack-plugin");

const { commonMainConfig, commonRendererConfig } = require("./webpack.common");

const mainConfig = merge(commonMainConfig, { mode: "production" });

const rendererConfig = merge(commonRendererConfig, {
  plugins: [new LodashModuleReplacementPlugin()],
  mode: "production"
});

module.exports = [mainConfig, rendererConfig];
