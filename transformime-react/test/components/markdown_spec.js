import React from 'react';

import { expect } from 'chai';

import { shallow } from 'enzyme';

import MarkdownDisplay from '../../src/components/markdown-display';

describe('MarkdownDisplay', () => {
  it('renders some markdown', () => {
    const component = shallow(
      <MarkdownDisplay data={'# Heading\nWoo.'} />
    );

    expect(component.node.props.source).to.equal('# Heading\nWoo.');
  });
});
