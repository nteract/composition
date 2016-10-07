import React from 'react';
import { expect } from 'chai';

const imageData = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

import { shallow } from 'enzyme';

import ImageDisplay, {
  PNGDisplay,
  GIFDisplay,
  JPEGDisplay,
} from '../../../../src/notebook/components/transforms/image';

describe('ImageDisplay', () => {
  it('creates an image based on data and mimetype', () => {
    const component = shallow(
      <ImageDisplay data={imageData} mimetype="image/png" />
    );

    const img = component.find('img');
    // Slight a11y check
    expect(img.prop('role')).to.equal('presentation');
    expect(img.prop('src')).to.equal(`data:image/png;base64,${imageData}`);
  });
});

describe('ImageDisplay', () => {
  it('accepts metadata for the size', () => {
    const component = shallow(
      <ImageDisplay data={imageData} mimetype="image/png" metadata={{ width: '200' }} />
    );

    const img = component.find('img');
    expect(img.prop('width')).to.equal('200');

    const component2 = shallow(
      <ImageDisplay data={imageData} mimetype="image/png" metadata={{ width: '200', height: '300' }} />
    );

    const img2 = component2.find('img');
    expect(img2.prop('width')).to.equal('200');
    expect(img2.prop('height')).to.equal('300');
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
