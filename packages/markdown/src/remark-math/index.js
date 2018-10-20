// @flow

import inlinePlugin from "./inline.js";
import blockPlugin from "./block.js";

export function mathPlugin(opts: Object = {}) {
  blockPlugin.call(this, opts);
  inlinePlugin.call(this, opts);
}

export default mathPlugin;
