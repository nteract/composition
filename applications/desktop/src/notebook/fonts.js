// @flow

const WebFont = require("webfontloader");
const path = require("path");

const assetPage = path.resolve(path.dirname(require.resolve("nteract-assets")));

WebFont.load({
  custom: {
    families: ["Source Sans Pro", "Source Code Pro"],
    urls: [
      path.join(assetPage, "fonts", "source-sans-pro", "source-sans-pro.css"),
      path.join(assetPage, "fonts", "source-code-pro", "source-code-pro.css")
    ]
  }
});
