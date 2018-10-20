/* @flow */

import TextDisplay from "./text.js";
import JsonDisplay from "./json.js";
import JavaScriptDisplay from "./javascript.js";
import HTMLDisplay from "./html.js";
import MarkdownDisplay from "./markdown.js";
import LaTeXDisplay from "./latex.js";
import SVGDisplay from "./svg.js";
import { PNGDisplay, JPEGDisplay, GIFDisplay } from "./image.js";
import VDOMDisplay from "@nteract/transform-vdom";

type Transform = {
  MIMETYPE: string
};

type Transforms = { [string]: Transform };
type DisplayOrder = Array<string>;

export type TransformRegister = {
  transforms: Transforms,
  displayOrder: DisplayOrder
};

const tfs = [
  VDOMDisplay,
  JsonDisplay,
  JavaScriptDisplay,
  HTMLDisplay,
  MarkdownDisplay,
  LaTeXDisplay,
  SVGDisplay,
  GIFDisplay,
  PNGDisplay,
  JPEGDisplay,
  TextDisplay
];

export const standardTransforms: Transforms = {};

tfs.forEach(transform => {
  standardTransforms[transform.MIMETYPE] = transform;
});

export const standardDisplayOrder: DisplayOrder = tfs.map(
  transform => transform.MIMETYPE
);

export function registerTransform(
  { transforms, displayOrder }: TransformRegister,
  transform: Transform
) {
  return {
    transforms: {
      ...transforms,
      [transform.MIMETYPE]: transform
    },
    displayOrder: [transform.MIMETYPE, ...displayOrder]
  };
}

/**
 * Choose the richest mimetype available based on the displayOrder and transforms
 * @param  {Map}   bundle - Map({mimetype1: data1, mimetype2: data2, ...})
 * @param  {Array} ordered list of mimetypes - ['text/html', 'text/plain']
 * @param  {Map}   mimetype -> React Component - Map({'text/plain': TextTransform})
 * @return {string}          Richest mimetype
 */

export function richestMimetype(
  bundle: Object,
  order: DisplayOrder = standardDisplayOrder,
  tf: Transforms = standardTransforms
): ?string {
  return (
    [...Object.keys(bundle)]
      // we can only use those we have a transform for
      .filter(mimetype => tf[mimetype] && order.includes(mimetype))
      // the richest is based on the order in displayOrder
      .sort((a, b) => order.indexOf(a) - order.indexOf(b))[0]
  );
}
export const transforms = standardTransforms;
export const displayOrder = standardDisplayOrder;
export const TextTransform = TextDisplay;
export const JSONTransform = JsonDisplay;
export const JavaScriptTransform = JavaScriptDisplay;
export const HTMLTransform = HTMLDisplay;
export const MarkdownTransform = MarkdownDisplay;
export const LaTeXTransform = LaTeXDisplay;
export const SVGTransform = SVGDisplay;
export const PNGTransform = PNGDisplay;
export const JPEGTransform = JPEGDisplay;
export const GIFTransform = GIFDisplay;
export const VDOMTransform = VDOMDisplay;
