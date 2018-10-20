module.exports = function(api) {
  const env = api.env(); // eslint-disable-line no-unused-vars

  const config = {
    presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-flow"],
    plugins: [
      "@babel/plugin-transform-flow-strip-types",
      "styled-jsx/babel",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-class-properties",
      [
        "@babel/plugin-transform-runtime",
        {
          corejs: 2
        }
      ]
    ]
  };

  return config;
};
