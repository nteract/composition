/* @flow */

const path = require("path");

const WebFont = require("webfontloader");

const fontFolder = ["..", "node_modules", "nteract-assets", "fonts"];

WebFont.load({
  // $FlowFixMe
  custom: {
    families: ["Source Sans Pro", "Source Code Pro"],
    urls: [
      path.join(...fontFolder, "source-sans-pro", "source-sans-pro.css"),
      path.join(...fontFolder, "source-code-pro", "source-code-pro.css")
    ]
  }
});
