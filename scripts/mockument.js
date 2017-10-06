// For some reason, this property does not get set above.
global.Image = global.window.Image;

global.Range = function Range() {};

const enzyme = require("enzyme");
const Adapter = require("enzyme-adapter-react-16");

enzyme.configure({ adapter: new Adapter() });

const createContextualFragment = html => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.children[0]; // so hokey it's not even funny
};

Range.prototype.createContextualFragment = html =>
  createContextualFragment(html);

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
