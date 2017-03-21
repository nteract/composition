import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import Toolbar from '../../../src/notebook/providers/toolbar';
import { dummyStore } from '../../utils';

describe('toolbar provider', () => {
  const store = dummyStore();

  const setup = (type, id) => mount(
    <Provider store={store}>
      <Toolbar type={type} id={id} />
    </Provider>,
    );

  it('is mountable', () => {
    const toolbar = setup('code', 'cell');
  })
})
