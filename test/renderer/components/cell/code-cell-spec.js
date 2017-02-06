import React from 'react';

import { Provider } from 'react-redux';
import { shallow, mount } from 'enzyme';
import Immutable from 'immutable';
import { expect } from 'chai';

import { dummyStore } from '../../../utils';
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
    const store = dummyStore();

    const cell = mount(
      <Provider store={store}>
        <CodeCell
          cell={emptyCodeCell} {...sharedProps}
          cellStatus={
            Immutable.Map({
              outputHidden: false,
              inputHidden: false,
              outputExpanded: false,
            })
          }
        />
      </Provider>,
    );
    expect(cell.find('.input').length).to.be.greaterThan(0);
  });
  it('creates a pager', () => {
    const store = dummyStore();

    const cell = mount(
      <Provider store={store}>
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
        />
      </Provider>,
    );
    expect(cell.find('.pagers').length).to.be.greaterThan(0);
  });
});
