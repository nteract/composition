import React from 'react';
import { expect } from 'chai';

import { mount } from 'enzyme';

import LaTeXDisplay from '../../../../src/notebook/components/transforms/latex';

describe('LaTeXDisplay', () => {
  it('processes basic LaTeX', () => {
    const component = mount(
      <LaTeXDisplay data={'x^2 + y = 3'} />
    );

    const rendered = component.render();
    expect(rendered.html()).to.equal('<div>x^2 + y = 3</div>');
  });
  it('updates the LaTeX', () => {
    const component = mount(
      <LaTeXDisplay data={'x^2 + y = 3'} />
    );
    let rendered = component.render();

    component.setProps({
      data: 'x^6 + z = 55',
    })

    rendered = component.render();
    expect(rendered.html()).to.equal('<div>x^6 + z = 55</div>');
  });
});
