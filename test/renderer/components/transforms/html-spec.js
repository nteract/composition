import React from 'react';
import { expect } from 'chai';

import { mount } from 'enzyme';

import HTMLDisplay from '../../../../src/notebook/components/transforms/html';

describe('HTMLDisplay', () => {
  it('renders direct HTML', () => {
    const component = mount(
      <HTMLDisplay data={'<b>woo</b>'} />
    );

    expect(component.html()).to.equal('<div><b>woo</b></div>');
  });
  it('correctly chooses to update with data changing', () => {
    const wrapper = mount(
      <HTMLDisplay data={'<b>woo</b>'} />
    );

    const component = wrapper.instance() ;
    expect(component.shouldComponentUpdate({data: "<b>woo</b>"})).to.equal(false);
    expect(component.shouldComponentUpdate({data: "<b>womp</b>"})).to.equal(true);
  });
  it('updates the underlying HTML when data changes', () => {
    const wrapper = mount(
      <HTMLDisplay data={'<b>woo</b>'} />
    );

    wrapper.setProps({ data: "<b>womp</b>" });

    expect(wrapper.html()).to.equal('<div><b>womp</b></div>');
  });
});
