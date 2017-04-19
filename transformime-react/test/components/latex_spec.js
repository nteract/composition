import React from 'react';
import { expect } from 'chai';

import { shallow } from 'enzyme';

import LaTeXDisplay from '../../src/components/latex-display';

describe('LaTeXDisplay', () => {
  it('processes basic LaTeX', () => {
    const component = shallow(
      <LaTeXDisplay data={'x^2 + y = 3'} />
    );

    const rendered = component.render();
    expect(rendered[0].children[0].children[0].attribs.class).to.equal('katex');
  });
});
