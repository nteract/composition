import React from 'react';

import { shallow, mount } from 'enzyme';
import Immutable from 'immutable';
import { expect } from 'chai';

import CodeCell from '../../../../src/notebook/components/cell/code-cell';
import { emptyCodeCell } from '../../../../packages/commutable';
import { displayOrder, transforms } from '../../../../src/notebook/components/transforms';

const sharedProps = { displayOrder, transforms };
describe('CodeCell', () => {
  it('can be rendered', () => {
    const cell = shallow(
      <CodeCell
        cell={emptyCodeCell} {...sharedProps}
        cellStatus={
        Immutable.Map({
          outputHidden: false,
          inputHidden: false,
          outputExpanded: false,
        })
      }
      />,
    );
    expect(cell).to.not.be.null;
  });
  it('creates an editor', () => {
    const cell = mount(
      <CodeCell
        cell={emptyCodeCell} {...sharedProps}
        cellStatus={
        Immutable.Map({
          outputHidden: false,
          inputHidden: false,
          outputExpanded: false,
        })
      }
      />,
    );
    expect(cell.find('.input').length).to.be.greaterThan(0);
  });
  it('creates a pager', () => {
    const cell = mount(
      <CodeCell
        cell={emptyCodeCell} {...sharedProps}
        cellStatus={
        Immutable.Map({
          outputHidden: false,
          inputHidden: false,
          outputExpanded: false,
        })
      }
        pagers={Immutable.fromJS([{ data: { 'text/plain': 'one' } }])}
      />,
    );
    expect(cell.find('.pagers').length).to.be.greaterThan(0);
  });
});
