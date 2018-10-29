module.exports = function(api) {
  if (api) {
    const env = api.env(); // eslint-disable-line no-unused-vars
  }

  const config = {
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: [
      "styled-jsx/babel",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-proposal-object-rest-spread",
      "@babel/plugin-proposal-class-properties",
      [
        "@babel/plugin-transform-runtime",
        {
          corejs: 2
        }
      ],
    ],
    overrides: [
      {
        test: ['**/*.js', '**/*.jsx'],
        presets: ["@babel/preset-flow"],
        plugins: ["@babel/plugin-transform-flow-strip-types"]
      },
      {
        test: ['**/*.ts', '**/*.tsx'],
        presets: ["@babel/preset-typescript"],
      },
    ]
  };

  return config;
};
