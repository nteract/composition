import React from 'react';
import { expect } from 'chai';

import { mount } from 'enzyme';

import JavascriptDisplay, { runCodeHere } from '../../../../src/notebook/components/transforms/javascript';

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

  it('creates a nice little error area', () => {
    const component = mount(
      <JavascriptDisplay data={'throw "a fit"'} />
    );
    const instance = component.instance();
    expect(instance.el.firstChild.localName).to.equal('pre');
    expect(instance.el.firstChild.textContent).to.equal('a fit');
  });

  it('creates a nice little error area with a stack', () => {
    const component = mount(
      <JavascriptDisplay data={'throw new Error("a fit")'} />
    );
    const instance = component.instance();
    expect(instance.el.firstChild.localName).to.equal('pre');
    expect(instance.el.firstChild.textContent).to.include('Error: a fit');
  })

  it('handles updates by running again', () => {
    global.x = 0;
    const component = mount(
      <JavascriptDisplay data={'x = 1'} />
    );
    component.setProps({ data: 'x = x + 1' })
    expect(x).to.equal(2);
    delete global.x;
  });
});

describe('runCodeHere', () => {
  it('runs code with `element` available', () => {
    const el = document.createElement('div');
    const element = runCodeHere(el, 'element');
    expect(el).to.equal(element);
  })
})
