/* @flow */

import TextDisplay from "./text";
import JsonDisplay from "./json";
import JavaScriptDisplay from "./javascript";
import HTMLDisplay from "./html";
import MarkdownDisplay from "./markdown";
import LaTeXDisplay from "./latex";
import SVGDisplay from "./svg";
import { PNGDisplay, JPEGDisplay, GIFDisplay } from "./image";
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
