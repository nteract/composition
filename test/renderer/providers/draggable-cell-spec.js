import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import CellCreator from '../../../src/notebook/providers/draggable-cell';
import { dummyStore } from '../../utils'

import {
  FOCUS_CELL,
} from '../../../src/notebook/constants';

describe('DraggableCellProvider', () => {
  const store = dummyStore()

  const setup = (id, dispatch) => {
    return mount(
      <Provider store={store}>
        <DraggableCell dispatch={store.dispatch} id={id} />
      </Provider>
    );
  }

  it('can be constructed', () => {
    const component = setup('test')
    expect component.to.not.be.null();
  });


})
