// @format
const path = require("path");

const babelFlowConfig = require("./babel.flow.config");
const babelTypescriptConfig = require("./babel.typescript.config");
var {
  exclude,
  mergeDefaultAliases
} = require("./packages/webpack-configurator");

module.exports = {
  title: "nteract components",
  defaultExample: false,
  sections: [
    {
      name: "Data Explorer",
      components: "packages/transform-dataresouce/src/*.js"
    },
    {
      name: "Presentational Components",
      components: "packages/presentational-components/src/components/*.js"
    },
    {
      name: "Outputs",
      components: "packages/outputs/src/components/*.js"
    },
    {
      name: "Media Outputs",
      components: "packages/outputs/src/components/media/*.js",
      content: "packages/outputs/src/components/media/index.md",
      ignore: "packages/outputs/src/components/media/index.js"
    },
    {
      name: "Binder Hosts and Kernels",
      components: "packages/host-cache/src/components/*.js"
    },
    {
      name: "Directory Listing",
      components: "packages/directory-listing/src/components/*.js"
    },
    {
      name: "Maths",
      content: "packages/mathjax/examples.md"
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
  compilerConfig: {
    // Allow us to use {...props}
    objectAssign: "Object.assign",
    transforms: {
      // whether template strings get transpiled (we don't want it to, so that we can use the native functionality)
      templateString: false
    }
  },
  webpackConfig: {
    node: {
      fs: "empty",
      child_process: "empty",
      net: "empty"
    },
    resolve: {
      mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      alias: mergeDefaultAliases()
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude,
          loader: "babel-loader",
          options: babelFlowConfig(),
        },
        {
          test: /\.tsx?$/,
          exclude,
          loader: "babel-loader",
          options: babelTypescriptConfig(),
      },
      ]
    }
  }
};
