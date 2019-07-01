// @format

const path = require("path");

const reactDocgenTypescript = require("react-docgen-typescript").withCustomConfig(
  "./tsconfig.base.json"
);

const typescriptPropsParser = reactDocgenTypescript.parse;

module.exports = {
  title: "nteract components",
  defaultExample: false,
  propsParser: typescriptPropsParser,
  resolver: require("react-docgen").resolver.findAllComponentDefinitions,
  getComponentPathLine: componentPath => {
    const toPascalCase = string => {
      return string
        .match(/[a-z]+/gi)
        .map(function(word) {
          return word.charAt(0).toUpperCase() + word.substr(1).toLowerCase();
        })
        .join("");
    };
    const name = path.basename(componentPath, ".tsx");
    const dir = path.dirname(componentPath);
    const package = dir.match(new RegExp("packages[\\\\/](.*)[\\\\/]src"));
    return `import { ${toPascalCase(name)} } from '@nteract/${package[1]}';`;
  },
  sections: [
    {
      name: "Introduction",
      content: "doc/components.md"
    },
    {
      name: "@nteract/presentational-components",
      components: "packages/presentational-components/src/components/*.tsx"
    },
    {
      name: "@nteract/outputs",
      components: "packages/outputs/src/components/*.tsx"
    },
    {
      name: "@nteract/outputs/media",
      components: "packages/outputs/src/components/media/*.tsx",
      content: "packages/outputs/src/components/media/index.md",
      ignore: "packages/outputs/src/components/media/index.tsx"
    },
    // {
    //   name: "@mybinder/host-cache",
    //   components: "packages/host-cache/src/components/*.tsx"
    // },
    {
      name: "@nteract/directory-listing",
      components: "packages/directory-listing/src/components/*.tsx"
    },
    {
      name: "@nteract/markdown",
      content: "packages/markdown/examples.md"
    },
    {
      name: "@nteract/mathjax",
      content: "packages/mathjax/examples.md"
    },
    {
      name: "@nteract/monaco-editor",
      content: "packages/monaco-editor/src/monaco.md"
    }
  ],
  // For overriding the components styleguidist uses
  styleguideComponents: {
    LogoRenderer: path.join(__dirname, "styleguide-components", "logo.tsx")
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
      net: "empty",
      canvas: "empty"
    },
    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json", ".css"]
    },
    externals: ["canvas"],
    module: {
      rules: [
        
        // Add support for CSS
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.tsx?$/,
          loader: "ts-loader",
          options: {
            compilerOptions: {
              strict: true,
              jsx: "react",
              composite: true
            },
            projectReferences: true,
            transpileOnly: true
          }
        }

      ]
    }
  }
};
