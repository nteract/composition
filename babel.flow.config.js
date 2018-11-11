const config = require("./babel.config");

module.exports = function(api) {
  const baseConfig = config(api);
  return {
    ...baseConfig,
    presets: [...baseConfig.presets, "@babel/preset-flow"],
    plugins: [...baseConfig.plugins, "@babel/plugin-transform-flow-strip-types"]
  };
};
