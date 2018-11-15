// @format

const path = require("path");

const reactDocgenTypescript = require("react-docgen-typescript").withCustomConfig(
  "./tsconfig.base.json"
);

const babelFlowConfig = require("./babel.flow.config");
const babelTypescriptConfig = require("./babel.typescript.config");
var {
  exclude,
  mergeDefaultAliases
} = require("./packages/webpack-configurator");

const typescriptPropsParser = reactDocgenTypescript.parse;

module.exports = {
  title: "nteract components",
  defaultExample: false,
  sections: [
    {
      name: "@nteract/presentational-components",
      components: "packages/presentational-components/src/components/*.tsx"
    },
    {
      name: "@nteract/outputs",
      components: "packages/outputs/src/components/*.js"
    },
    {
      name: "@nteract/outputs/media",
      components: "packages/outputs/src/components/media/*.js",
      content: "packages/outputs/src/components/media/index.md",
      ignore: "packages/outputs/src/components/media/index.js"
    },
    {
      name: "@mybinder/host-cache",
      components: "packages/host-cache/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/directory-listing",
      components: "packages/directory-listing/src/components/*.js"
    },
    {
      name: "@nteract/markdown",
      content: "packages/markdown/examples.md"
    },
    {
      name: "@nteract/mathjax",
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
          options: babelFlowConfig()
        },
        {
          test: /\.tsx?$/,
          exclude,
          loader: "babel-loader",
          options: babelTypescriptConfig()
        }
      ]
    }
  }
};
