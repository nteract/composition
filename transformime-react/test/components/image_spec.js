import React from 'react';
import { expect } from 'chai';

const imageData = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

import { shallow } from 'enzyme';

import {
  ImageDisplay,
  PNGDisplay,
  GIFDisplay,
  JPEGDisplay,
} from '../../src/components/image-display';

describe('ImageDisplay', () => {
  it('creates an image based on data and mimetype', () => {
    const component = shallow(
      <ImageDisplay data={imageData} mimetype="image/png" />
    );
    expect(component.html()).to.equal(`<img role="presentation" src="data:image/png;base64,${imageData}"/>`);
  });
});

describe('PNGDisplay', () => {
  it('renders a single image base64 inline', () => {
    const component = shallow(
      <PNGDisplay data={imageData} />
    );

    expect(component.equals(
      <ImageDisplay
        mimetype="image/png"
        data={imageData}
      />
    )).to.equal(true);
  });
});

describe('JPEGDisplay', () => {
  it('renders a single image base64 inline', () => {
    const component = shallow(
      <JPEGDisplay data={imageData} />
    );

    expect(component.equals(
      <ImageDisplay
        mimetype="image/jpeg"
        data={imageData}
      />
    )).to.equal(true);
  });
});

describe('GIFDisplay', () => {
  it('renders a single image base64 inline', () => {
    const component = shallow(
      <GIFDisplay data={imageData} />
    );

    expect(component.equals(
      <ImageDisplay
        mimetype="image/gif"
        data={imageData}
      />
    )).to.equal(true);
  });
});
