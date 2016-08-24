import React from 'react';
import { expect } from 'chai';

import { mount } from 'enzyme';

import JavascriptDisplay from '../../src/components/javascript-display';

describe('JavascriptDisplay', () => {
  it('renders contextual div tag', () => {
    const component = mount(
      <JavascriptDisplay data={''} />
    );
    expect(component.html()).to.equal('<div></div>');
  });
  it('executes the Javascript', () => {
    const component = mount(
      <JavascriptDisplay data={'window._test_variable = 5;'} />
    );
    expect(window._test_variable).to.equal(5);
  });
});
