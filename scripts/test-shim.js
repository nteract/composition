// For some reason, this property does not get set above.
global.Image = global.window.Image;

global.Range = function Range() {};

const createContextualFragment = html => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.children[0]; // so hokey it's not even funny
};

Range.prototype.createContextualFragment = html =>
  createContextualFragment(html);

global.window.focus = () => {};

// HACK: Polyfil that allows codemirror to render in a JSDOM env.
global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => ({ right: 0 }),
    getClientRects: () => [],
    createContextualFragment
  };
};

// HACK: To test index.js
document.querySelector = () => document.createElement("div");

process.on("unhandledRejection", (error, promise) => {
  console.error("Unhandled promise rejection somewhere in tests");
  console.error(error);
  console.error(error.stack);
  promise.catch(err => console.error("promise rejected", err));
});
