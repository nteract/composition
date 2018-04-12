// @flow

// TODO: There is the potential to have a Flash-of-Unstyled-Content since this is
//       now async
const WebFont = require("webfontloader");

WebFont.load({
  google: {
    families: ["Source Sans Pro", "Source Serif Pro", "Source Code Pro"]
  }
});
