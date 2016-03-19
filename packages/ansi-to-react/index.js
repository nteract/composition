import React from 'react';

const ansiToJSON = require('ansi-to-json');

function ansiJSONtoStyleBundle(ansiBundle) {
  const style = {};
  if (ansiBundle.bg) {
    style.backgroundColor = `rgb(${ansiBundle.bg})`;
  }
  if (ansiBundle.fg) {
    style.color = `rgb(${ansiBundle.fg})`;
  }
  return {
    content: ansiBundle.content,
    style,
  };
}

function ansiToInlineStyle(text) {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}

function inlineBundleToReact(bundle, key) {
  return (
    <span style={bundle.style} key={key}>{bundle.content}</span>
  );
}

function Ansi(props) {
  const { text } = props;
  return (
    <code>
      {ansiToInlineStyle(text).map(inlineBundleToReact)}
    </code>
  );
}

Ansi.propTypes = {
  text: React.PropTypes.string,
};

module.exports = Ansi;
