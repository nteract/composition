// @format
const path = require("path");

module.exports = {
  title: "nteract components",
  sections: [
    {
      name: "Presentational Components",
      components: "packages/presentational-components/src/components/*.js"
    },
    {
      name: "Dropdown Menu Components",
      components: "packages/dropdown-menu/src/components/*.js"
    }
  ],
  // For overriding the components styleguidist uses
  styleguideComponents: {
    LogoRenderer: path.join(
      __dirname,
      "packages",
      "styleguide-components",
      "logo.js"
    )
  },
  webpackConfig: {
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          loader: "babel-loader"
        }
      ]
    }
  }
};
