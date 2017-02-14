import React from 'react';
import Immutable from 'immutable';

import { shallow } from 'enzyme';

import {
  RichestMime
} from '../';

import { displayOrder, transforms } from '@nteract/transforms';

describe('RichestMime', () => {
  it('renders a mimebundle', () => {
    const models = Immutable.fromJS({});
    const rm = shallow(
      <RichestMime
        displayOrder={displayOrder}
        transforms={transforms}
        bundle={Immutable.fromJS({ 'text/plain': 'THE DATA' })}
        metadata={Immutable.fromJS({ 'text/plain': 'alright' })}
        models={models}
      />,
    );

    expect(rm.instance().shouldComponentUpdate()).to.be.true;
    expect(rm.first().props()).to.deep.equal({
      data: 'THE DATA',
      theme: 'light',
      metadata: 'alright',
      models,
    });
  });
  it('does not render unknown mimetypes', () => {
    const rm = shallow(
      <RichestMime
        displayOrder={displayOrder}
        transforms={transforms}
        bundle={Immutable.fromJS({ 'application/ipynb+json': '{}' })}
      />,
    );

    expect(rm.type()).to.be.null;
  });
});
