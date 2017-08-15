const requirejs = require("requirejs");

// Copy over some of the require functions
requirejs.resolve = require.resolve;
requirejs.cache = require.cache;
requirejs.extensions = require.extension;
requirejs.main = require.main;

// However, we'll overload particular nbextension names with our own polyfills

module.exports = requirejs;
