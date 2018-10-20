// @flow strict
import { deepFreeze } from "./freeze";

// Straight from nbformat
export type MultilineString = string | Array<string>;

export type OnDiskMimebundle = {
  "text/plain"?: MultilineString,
  "text/html"?: MultilineString,
  "text/latex"?: MultilineString,
  "text/markdown"?: MultilineString,

  "application/javascript"?: MultilineString,

  "image/png"?: MultilineString,
  "image/jpeg"?: MultilineString,
  "image/gif"?: MultilineString,
  "image/svg+xml"?: MultilineString,
  "text/vnd.plotly.v1+html"?: MultilineString,

  // The JSON mimetype has some corner cases because of the protocol / format assuming the values
  // in a mimebundle are either:
  //
  //   * A string, which would be deserialized
  //   * An array, which would have to be assumed to be a multiline string
  //
  "application/json"?: string | Array<string> | {},

  "application/vdom.v1+json"?: {},
  "application/vnd.dataresource+json"?: {},

  "text/vnd.plotly.v1+html"?: MultilineString,
  "application/vnd.plotly.v1+json"?: {},
  "application/geo+json"?: {},

  "application/x-nteract-model-debug+json"?: {},

  "application/vnd.vega.v2+json"?: {},
  "application/vnd.vega.v3+json"?: {},
  "application/vnd.vegalite.v1+json"?: {},
  "application/vnd.vegalite.v2+json"?: {},

  [key: string]: string | Array<string> | {}
};

// Enumerating over all the media types we currently accept
export type MediaBundle = {
  "text/plain"?: string,
  "text/html"?: string,
  "text/latex"?: string,
  "text/markdown"?: string,

  "application/javascript"?: string,

  "image/png"?: string,
  "image/jpeg"?: string,
  "image/gif"?: string,
  "image/svg+xml"?: string,

  "application/json"?: {},

  "application/vdom.v1+json"?: {},
  "application/vnd.dataresource+json"?: {},

  "text/vnd.plotly.v1+html"?: string,
  "application/vnd.plotly.v1+json"?: {},
  "application/geo+json"?: {},

  "application/x-nteract-model-debug+json"?: {},

  "application/vnd.vega.v2+json"?: {},
  "application/vnd.vega.v3+json"?: {},
  "application/vnd.vegalite.v1+json"?: {},
  "application/vnd.vegalite.v2+json"?: {},
  [key: string]: string | Array<string> | {} // all others
};

export type MimeBundle = MediaBundle;

/**
 * Turn nbformat multiline strings (arrays of strings for simplifying diffs) into strings
 */
export function demultiline(s: string | Array<string>): string {
  if (Array.isArray(s)) {
    return s.join("");
  }
  return s;
}

/**
 * Split string into a list of strings delimited by newlines, useful for on-disk git comparisons,
 * and is the expectation for jupyter notebooks on disk
 */
export function remultiline(s: string | Array<string>): Array<string> {
  if (Array.isArray(s)) {
    // Assume
    return s;
  }
  // Use positive lookahead regex to split on newline and retain newline char
  return s.split(/(.+?(?:\r\n|\n))/g).filter(x => x !== "");
}

function isJSONKey(key) {
  return /^application\/(.*\+)?json$/.test(key);
}

export function createImmutableMimeBundle(
  mimeBundle: OnDiskMimebundle
): MimeBundle {
  // Map over all the mimetypes, turning them into our in-memory format
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": ["<p>\n", "Hey\n", "</p>"],
  //   "text/plain": "Hey"
  // }
  //
  // to
  //
  // {
  //   "application/json": {"a": 3, "b": 2},
  //   "text/html": "<p>\nHey\n</p>",
  //   "text/plain": "Hey"
  // }

  // Since we have to convert from one type to another that has conflicting types, we need to hand convert it in a way that
  // flow is able to verify correctly. The way we do that is create a new object that we declare with the type we want,
  // set the keys and values we need, then seal the object with Object.freeze
  const bundle: MimeBundle = {};

  for (const key in mimeBundle) {
    if (
      !isJSONKey(key) &&
      (typeof mimeBundle[key] === "string" || Array.isArray(mimeBundle[key]))
    ) {
      // Because it's a string, we can't mutate it anyways (and don't have to Object.freeze it)
      bundle[key] = demultiline(mimeBundle[key]);
    } else {
      // we now know it's an Object of some kind
      bundle[key] = deepFreeze(mimeBundle[key]);
    }
  }

  return Object.freeze(bundle);
}
