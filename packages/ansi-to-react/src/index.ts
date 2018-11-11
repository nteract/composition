import * as React from "react";
import { ansiToJson, AnserJsonEntry } from "anser";
import { escapeCarriageReturn } from "escape-carriage";

const LINK_REGEX = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/;

/**
 * Converts ANSI strings into JSON output.
 * @name ansiToJSON
 * @function
 * @param {String} input The input string.
 * @return {Array} The parsed input.
 */
function ansiToJSON(input: string) {
  input = escapeCarriageReturn(input);
  return ansiToJson(input, {
    json: true,
    remove_empty: true
  });
}

/**
 * Converts an Anser bundle into a React Node.
 * @param linkify whether links should be converting into clickable anchor tags.
 * @param bundle Anser output.
 */
function convertBundleIntoReact(
  linkify: boolean,
  bundle: AnserJsonEntry,
  key: number
) {
  const style: { backgroundColor?: string; color?: string } = {};
  if (bundle.bg) {
    style.backgroundColor = `rgb(${bundle.bg})`;
  }
  if (bundle.fg) {
    style.color = `rgb(${bundle.fg})`;
  }

  if (!linkify) {
    return React.createElement("span", { style, key }, bundle.content);
  }

  const words = bundle.content.split(" ").reduce(
    (words: React.ReactNode[], word: string, index: number) => {
      // If this isn't the first word, re-add the space removed from split.
      if (index !== 0) {
        words.push(" ");
      }

      // If  this isn't a link, just return the word as-is.
      if (!LINK_REGEX.test(word)) {
        words.push(word);
        return words;
      }

      words.push(
        React.createElement(
          "a",
          {
            key: index,
            href: word,
            target: "_blank"
          },
          `${word}`
        )
      );
      return words;
    },
    [] as React.ReactNode[]
  );
  return React.createElement("span", { style, key }, words);
}

declare type Props = {
  children: string;
  className?: string;
  linkify?: boolean;
};

export default function Ansi(props: Props) {
  return React.createElement(
    "code",
    { className: props.className },
    ansiToJSON(props.children).map(
      convertBundleIntoReact.bind(null, props.linkify)
    )
  );
}
