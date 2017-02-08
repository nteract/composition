import React from 'react';
import { expect } from 'chai';

import { mount } from 'enzyme';

import Text from '../../../../packages/transforms/text';

describe('Text', () => {
  it('renders plain text', () => {
    const wrapper = mount(
      <Text data={'hey'} />,
    );

    expect(wrapper.html()).to.equal('<code><span>hey</span></code>');

    const component = wrapper.instance();

    expect(component.shouldComponentUpdate()).to.equal(true);
  });
});
