'use strict';

var React = require('react');

var ansiToJSON = require('ansi-to-json');

function ansiJSONtoStyleBundle(ansiBundle) {
  var style = {};
  if (ansiBundle.bg) {
    style.backgroundColor = 'rgb(' + ansiBundle.bg + ')';
  }
  if (ansiBundle.fg) {
    style.color = 'rgb(' + ansiBundle.fg + ')';
  }
  return {
    content: ansiBundle.content,
    style: style
  };
}

function ansiToInlineStyle(text) {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}

function inlineBundleToReact(bundle, key) {
  return React.createElement('span', {
    style: bundle.style,
    key: key
  }, bundle.content);
}

function Ansi(props) {
  return React.createElement(
    'code',
    {},
    ansiToInlineStyle(props.children).map(inlineBundleToReact));
}

Ansi.propTypes = {
  children: React.PropTypes.string
};

module.exports = Ansi;
