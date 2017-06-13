/* @flow */

var embed = require("vega-embed");

export function vega(element: HTMLElement) {
  return {
    // Copied over from https://github.com/vega/ipyvega/blob/9de1958fa3341535f4e03989923415b5dafa48ee/src/index.js
    // Then **heavily** trimmed and turned into a thunk
    render: function(
      selector: string, // ignored
      spec: Object,
      type: string,
      output_area: any // ignored
    ) {
      var embedSpec = {
        mode: type,
        spec: spec
      };

      // HACK: we use the element from this scope to render vega.
      // `selector` and `output_area` are ignored
      embed(element, embedSpec, function(error, result) {});
    }
  };
}
