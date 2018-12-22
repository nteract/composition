// @format

const path = require("path");

const reactDocgenTypescript = require("react-docgen-typescript").withCustomConfig(
  "packages/tsconfig.base.json"
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
      name: "Introduction",
      content: "doc/components.md"
    },
    {
      name: "@nteract/presentational-components",
      components: "packages/presentational-components/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/outputs",
      components: "packages/outputs/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/outputs/media",
      components: "packages/outputs/src/components/media/*.tsx",
      content: "packages/outputs/src/components/media/index.md",
      ignore: "packages/outputs/src/components/media/index.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@mybinder/host-cache",
      components: "packages/host-cache/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/directory-listing",
      components: "packages/directory-listing/src/components/*.tsx",
      propsParser: typescriptPropsParser
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
  template: {
    body: {
      raw: `
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-129108362-2"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'UA-129108362-2');
        </script>`
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
