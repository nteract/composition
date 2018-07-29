// @format
const path = require("path");

var {
  exclude,
  mergeDefaultAliases
} = require("./packages/webpack-configurator");

module.exports = {
  title: "nteract components",
  defaultExample: false,
  sections: [
    {
      name: "Presentational Components",
      components: "packages/presentational-components/src/components/*.js"
    },
    {
      name: "Binder Components",
      components: "packages/host-cache/src/components/*.js"
    },
    {
      name: "Directory Listing",
      components: "packages/directory-listing/src/components/*.js"
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
    node: {
      fs: "empty",
      child_process: "empty",
      net: "empty"
    },
    resolve: {
      mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
      alias: mergeDefaultAliases()
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude,
          loader: "babel-loader"
        }
      ]
    }
  }
};
