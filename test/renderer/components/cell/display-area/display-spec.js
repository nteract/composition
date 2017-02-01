import React from 'react';

import { shallow } from 'enzyme';
import { expect } from 'chai';
import Immutable from 'immutable';

import Display from '../../../../../src/notebook/components/cell/display-area';
import { displayOrder, transforms } from '../../../../../src/notebook/components/transforms';

describe('Display', () => {
  it('does not display when status is hidden', () => {
    const outputs = Immutable.fromJS([{
      output_type: 'display_data',
      data: {
        'text/html': 'Test content',
      },
    }]);
    const component = shallow(<Display
      outputs={outputs}
      isHidden
      theme={'light'}
      displayOrder={displayOrder}
      transforms={transforms}
    />);
    expect(component.contains(<div className="cell_display" />)).to.equal(false);
  });
  it('displays status when it is not hidden', () => {
    const outputs = Immutable.fromJS([{
      output_type: 'display_data',
      data: {
        'text/html': 'Test content',
      },
    }]);
    const component = shallow(<Display
      outputs={outputs}
      isHidden={false}
      theme={'light'}
      displayOrder={displayOrder}
      transforms={transforms}
    />);
    expect(component.contains(<div className="cell_display" />)).to.equal(false);
  });
});
