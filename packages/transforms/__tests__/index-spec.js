import { List, Map } from 'immutable';

import TextDisplay from '../src/text';

import {
  richestMimetype,
  transforms,
} from '../src';

describe('richestMimetype', () => {
  it('picks the richest of the mimetypes from a bundle with defaults', () => {
    const mimeBundle = new Map({
      'text/plain': 'Hello World',
    });

    expect(richestMimetype(mimeBundle)).toEqual('text/plain');

    expect(richestMimetype(new Map({
      'text/plain': 'Hello World',
      'image/png': 'imageData',
    }))).toEqual('image/png');
  });
  it('falls back to a simpler mimetype if a transform is not available', () => {
    const mimeBundle = new Map({
      'text/plain': 'Hello World',
      'text/html': '<b>NIY</b>',
    });

    const order = new List(['text/html', 'text/plain']);
    const myTransforms = new Map({ 'text/plain': TextDisplay });

    const mimetype = richestMimetype(mimeBundle, order, myTransforms);
    expect(mimetype).toEqual('text/plain');
  });
});

describe('transforms', () => {
  it('is a collection of default transforms that provide React components', () => {
    const mimeBundle = new Map({
      'text/plain': 'Hello World',
      'text/html': '<b>NIY</b>',
    });

    const mimetype = richestMimetype(mimeBundle, new List(['text/plain']));
    const Element = transforms.get(mimetype);

    expect(Element).toEqual(TextDisplay);
  });
});
