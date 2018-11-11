import inlinePlugin from "./inline";
import blockPlugin from "./block";

export function mathPlugin(this: any, opts: object = {}) {
  blockPlugin.call(this, opts);
  inlinePlugin.call(this, opts);
}

export default mathPlugin;
