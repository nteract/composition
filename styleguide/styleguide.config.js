// @format

const path = require("path");

const reactDocgenTypescript = require("react-docgen-typescript").withCustomConfig(
  "../tsconfig.json"
);

console.log("wtf mate");

const typescriptPropsParser = reactDocgenTypescript.parse;

module.exports = {
  title: "nteract components",
  defaultExample: false,
  sections: [
    {
      name: "Introduction",
      content: "../doc/components.md"
    },
    {
      name: "@nteract/presentational-components",
      components: "../packages/presentational-components/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/outputs",
      components: "../packages/outputs/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/outputs/media",
      components: "../packages/outputs/src/components/media/*.tsx",
      content: "../packages/outputs/src/components/media/index.md",
      ignore: "../packages/outputs/src/components/media/index.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@mybinder/host-cache",
      components: "../packages/host-cache/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/directory-listing",
      components: "../packages/directory-listing/src/components/*.tsx",
      propsParser: typescriptPropsParser
    },
    {
      name: "@nteract/markdown",
      content: "../packages/markdown/examples.md"
    },
    {
      name: "@nteract/mathjax",
      content: "../packages/mathjax/examples.md"
    }
  ],
  // For overriding the components styleguidist uses
  styleguideComponents: {
    LogoRenderer: path.join(
      __dirname,
      "..",
      "packages",
      "styleguide-components",
      "logo.js"
    )
  },
  resolver: require("react-docgen").resolver.findAllComponentDefinitions,
  propsParser: typescriptPropsParser,
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
  }
};
