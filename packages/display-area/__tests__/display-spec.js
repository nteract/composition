import React from 'react';

import { shallow } from 'enzyme';
import Immutable from 'immutable';

import { displayOrder, transforms } from '@nteract/transforms';
import { Display } from '../';

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
    expect(component.contains(<div className="cell_display" />)).toEqual(false);
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
    expect(component.contains(<div className="cell_display" />)).toEqual(false);
  });
});
