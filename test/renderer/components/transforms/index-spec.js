import React from 'react';
import { createRenderer } from 'react-addons-test-utils';
import { List, Map } from 'immutable';
import { expect } from 'chai';

import TextDisplay from '../../../../packages/transforms/text';

import {
  richestMimetype,
  transforms,
} from '../../../../packages/transforms-full';

describe('richestMimetype', () => {
  it('picks the richest of the mimetypes from a bundle with defaults', () => {
    const mimeBundle = new Map({
      'text/plain': 'Hello World',
    });

    expect(richestMimetype(mimeBundle)).to.equal('text/plain');

    expect(richestMimetype(new Map({
      'text/plain': 'Hello World',
      'image/png': 'imageData',
    }))).to.equal('image/png');
  });
  it('falls back to a simpler mimetype if a transform is not available', () => {
    const mimeBundle = new Map({
      'text/plain': 'Hello World',
      'text/html': '<b>NIY</b>',
    });

    const order = new List(['text/html', 'text/plain']);
    const myTransforms = new Map({ 'text/plain': TextDisplay });

    const mimetype = richestMimetype(mimeBundle, order, myTransforms);
    expect(mimetype).to.equal('text/plain');
  });
});

describe('transforms', () => {
  it('is a collection of default transforms that provide React components', () => {
    const shallowRenderer = createRenderer();

    const mimeBundle = new Map({
      'text/plain': 'Hello World',
      'text/html': '<b>NIY</b>',
    });

    const mimetype = richestMimetype(mimeBundle, new List(['text/plain']));
    const Element = transforms.get(mimetype);

    shallowRenderer.render(<Element data={mimeBundle.get(mimetype)} />);
    const result = shallowRenderer.getRenderOutput();
    expect(result.props.children).to.equal('Hello World');
  });
});
