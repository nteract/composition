/* @flow */

import * as React from "react";
import { ansiToJson } from "anser";
import { escapeCarriageReturn } from "escape-carriage";

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
  return ansiToJson(input, {
    json: true,
    remove_empty: true
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
    style
  };
}

export function ansiToInlineStyle(text: string) {
  return ansiToJSON(text).map(ansiJSONtoStyleBundle);
}

function linkifyBundle(bundle) {
  return {
    ...bundle,
    content: bundle.content.split(" ").reduce(
      (result, word, index) => [
        ...result,
        // Unless word is the first, prepend a space
        index === 0 ? "" : " ",
        // If word is a URL, return an <a> element
        /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/.test(
          word
        )
          ? React.createElement(
              "a",
              {
                key: index,
                href: word,
                target: "_blank"
              },
              `${word}`
            )
          : word
      ],
      []
    )
  };
}

function inlineBundleToReact(bundle, key) {
  return React.createElement(
    "span",
    {
      style: bundle.style,
      key
    },
    bundle.content
  );
}

type Props = {
  children: string,
  className?: string,
  linkify?: boolean
};

function Ansi(props: Props) {
  return React.createElement(
    "code",
    { className: props.className },
    props.linkify
      ? ansiToInlineStyle(props.children)
          .map(linkifyBundle)
          .map(inlineBundleToReact)
      : ansiToInlineStyle(props.children).map(inlineBundleToReact)
  );
}

export default Ansi;
