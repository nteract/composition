/* @flow */

const React = require('react');
const Anser = require('anser');
const escapeCarriageReturn = require('escape-carriage');

type AnserJsonEntry = {
  content: string,
  fg: string,
  bg: string,
  fg_truecolor: string,
  bg_truecolor: string,
  clearLine: boolean,
  was_processed: boolean,
  isEmpty: () => boolean
};

type AnserJson = Array<AnserJsonEntry>;

type AnsiBundle = {
  content: string,
  style: {
    color?: string,
    backgroundColor?: string
  }
};

/**
 * ansiToJson
 * Convert ANSI strings into JSON output.
 *
 * @name ansiToJSON
 * @function
 * @param {String} input The input string.
 * @return {Array} The parsed input.
 */
function ansiToJSON(input: string): AnserJson {
  input = escapeCarriageReturn(input);
  return Anser.ansiToJson(input, {
    json: true,
    remove_empty: true,
  });
}

function ansiJSONtoStyleBundle(ansiBundle: AnserJsonEntry): AnsiBundle {
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

function ansiToInlineStyle(text: string): Array<AnsiBundle> {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}

function linkifyBundle(bundle: AnsiBundle) {
  return {
    ...bundle,
    content: bundle.content.split(' ').reduce((result, word, index) => [
      ...result,
      // Unless word is the first, prepend a space
      index === 0 ? '' : ' ',
      // If word is a URL, return an <a> element
      /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/.test(word)
        ? React.createElement(
            'a',
            {
              key: index,
              href: word,
              target: '_blank'
            },
            `${word}`
          )
        : word
    ], [])
  };
}

function inlineBundleToReact(bundle, key) {
  return React.createElement('span', {
    style: bundle.style,
    key,
  }, bundle.content);
}

function Ansi(props: {children: string, className?: string}) {
  return React.createElement(
    'code',
    {className: props.className},
    props.linkify
      ? ansiToInlineStyle(props.children)
        .map(linkifyBundle)
        .map(inlineBundleToReact)
      : ansiToInlineStyle(props.children).map(inlineBundleToReact)
  );
}

module.exports = Ansi;
