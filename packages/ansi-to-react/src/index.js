const React = require('react');
const Anser = require('anser');
const escapeCarriageReturn = require('escape-carriage');

/**
 * ansiToJson
 * Convert ANSI strings into JSON output.
 *
 * @name ansiToJSON
 * @function
 * @param {String} input The input string.
 * @return {Array} The parsed input.
 */
function ansiToJSON(input) {
  input = escapeCarriageReturn(input);
  return Anser.ansiToJson(input, {
    json: true,
    remove_empty: true,
  });
}

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

function linkifyBundle(bundle) {
  return {
    ...bundle,
    content: bundle.content.split(' ').reduce(
      (result, word) => {
        // If word is a URL
        if (/[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(word)) {
          return [
            ...result, 
            ' ',
            React.createElement('a', { 
              href: word ,
              target: '_blank'
            }, `${word}`) 
          ];
        }
        const lastWord = result.pop();
        if (lastWord) {
          // If lastWord is a `<a>` element
          if (lastWord.type) return [...result, lastWord, ' ', word];
          // If not, combine lastWord and word into single string
          return [...result, [lastWord, word].join(' ')];
        }
        // If there is no lastWord because word is the first
        return [...result, word];
      }, 
      []
    )
  }
}

function inlineBundleToReact(bundle, key) {
  return React.createElement('span', {
    style: bundle.style,
    key,
  }, bundle.content);
}

function Ansi(props) {
  return React.createElement(
    'code',
    {},
    props.linkify 
      ? ansiToInlineStyle(props.children)
        .map(linkifyBundle)
        .map(inlineBundleToReact)
      : ansiToInlineStyle(props.children).map(inlineBundleToReact)
  );
}

Ansi.propTypes = {
  children: React.PropTypes.string,
};

module.exports = Ansi;
