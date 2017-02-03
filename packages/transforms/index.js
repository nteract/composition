/* @flow */
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import React from 'react';

import TextDisplay from './text';
import JsonDisplay from './json';
import JavaScriptDisplay from './javascript';
import HTMLDisplay from './html';
import MarkdownDisplay from './markdown';
import LaTeXDisplay from './latex';

import SVGDisplay from './svg';

import {
  PNGDisplay,
  JPEGDisplay,
  GIFDisplay,
} from './image';

declare class Transform extends React.Component {
  MIMETYPE: string,
}

type Transforms = ImmutableMap<string, Transform>
type DisplayOrder = ImmutableList<string>

export type TransformRegister = {
  transforms: Transforms,
  displayOrder: DisplayOrder,
}

export const standardTransforms: Transforms = new ImmutableMap({
  'text/plain': TextDisplay,
  'image/png': PNGDisplay,
  'image/jpeg': JPEGDisplay,
  'image/gif': GIFDisplay,
  'image/svg+xml': SVGDisplay,
  'text/html': HTMLDisplay,
  'text/markdown': MarkdownDisplay,
  'text/latex': LaTeXDisplay,
  'application/json': JsonDisplay,
  'application/javascript': JavaScriptDisplay,
});

export const standardDisplayOrder: DisplayOrder = new ImmutableList([
  'application/json',
  'application/javascript',
  'text/html',
  'image/svg+xml',
  'text/markdown',
  'text/latex',
  'image/svg+xml',
  'image/gif',
  'image/png',
  'image/jpeg',
  'application/pdf',
  'text/plain',
]);


export function registerTransform(
  { transforms, displayOrder } : TransformRegister,
  transform: Transform
  ) {
  return {
    transforms: transforms.set(transform.MIMETYPE, transform),
    displayOrder: displayOrder.insert(0, transform.MIMETYPE)
  };
}

/**
 * Choose the richest mimetype available based on the displayOrder and transforms
 * @param  {ImmutableMap}   bundle - Map({mimetype1: data1, mimetype2: data2, ...})
 * @param  {ImmutableList}  ordered list of mimetypes - List(['text/html', 'text/plain'])
 * @param  {ImmutableMap}   mimetype -> React Component - Map({'text/plain': TextTransform})
 * @return {string}          Richest mimetype
 */

export function richestMimetype(bundle: ImmutableMap<string, any>,
  order: ImmutableList<string> = standardDisplayOrder,
  tf: ImmutableMap<string, any> = standardTransforms): string {
  return bundle.keySeq()
    // we can only use those we have a transform for
    .filter(mimetype => tf.has(mimetype) && order.includes(mimetype))
    // the richest is based on the order in displayOrder
    .sortBy(mimetype => order.indexOf(mimetype))
    .first();
}
