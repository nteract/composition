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
  return ansiToJson(escapeCarriageReturn(input), {
    json: true,
    remove_empty: true
  });
}

type BundleProps = {
  linkify: boolean | undefined;
  bundle: AnserJsonEntry;
};

/**
 * Converts an Anser bundle into a React Node.
 */
const AnsiBundle = React.memo(({ linkify, bundle }: BundleProps) => {
  const style: { backgroundColor?: string; color?: string } = {};
  if (bundle.bg) {
    style.backgroundColor = `rgb(${bundle.bg})`;
  }
  if (bundle.fg) {
    style.color = `rgb(${bundle.fg})`;
  }

  if (!linkify) {
    return <span style={style}>{bundle.content}</span>;
  }

  const words = bundle.content
    .split(" ")
    .reduce((words: React.ReactNode[], word: string, index: number) => {
      // If this isn't the first word, re-add the space removed from split.
      if (index !== 0) {
        words.push(" ");
      }

      // If  this isn't a link, just return the word as-is.
      if (!LINK_REGEX.test(word)) {
        words.push(word);
        return words;
      }

      words.push(<a href={word} target={"_blank"}>{`${word}`}</a>);
      return words;
    }, []);

  return <span style={style}>{words}</span>;
});

type Props = {
  children: string;
  className?: string;
  linkify?: boolean;
};

const Ansi = (props: Props) => (
  <code className={props.className}>
    {ansiToJSON(props.children).map((bundle, idx) => (
      <AnsiBundle
        linkify={props.linkify}
        bundle={bundle}
        key={`${bundle.content}-${idx}`}
      />
    ))}
  </code>
);

export default React.memo(Ansi);
