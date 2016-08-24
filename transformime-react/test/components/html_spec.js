import React from 'react';
import { expect } from 'chai';

import { mount } from 'enzyme';

import HTMLDisplay from '../../src/components/html-display';

describe('HTMLDisplay', () => {
  it('renders direct HTML', () => {
    const component = mount(
      <HTMLDisplay data={'<b>woo</b>'} />
    );

    expect(component.html()).to.equal('<div><b>woo</b></div>');
  });
  it.skip('executes embedded <script> tags', () => {
    // Skipped because setting innerHTML definitely doesn't
    // run the inline script
    // We'll want to use a document fragment like in transformime
  });
});
