import React from 'react';

import { expect } from 'chai';

import { shallow } from 'enzyme';

import MarkdownDisplay from '../../../../src/notebook/components/transforms/markdown';

describe('MarkdownDisplay', () => {
  it('renders some markdown', () => {
    const component = shallow(
      <MarkdownDisplay data={'# DO\nit.'} />
    );

    const instance = component.instance();

    // Slightly "testing" the library underneath, but it's still a decent litmus test
    expect(component.node.props.children[0].props.children[0]).to.equal('DO')
    expect(component.node.props.children[1].props.children[0]).to.equal('it.')

    expect(instance.shouldComponentUpdate({ data: '# DO\nit.' })).to.equal(false);
    expect(instance.shouldComponentUpdate({ data: '#WOO' })).to.equal(true);

  });
});
