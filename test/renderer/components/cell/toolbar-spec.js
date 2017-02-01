import React from 'react';

import { mount } from 'enzyme';

import { emptyCodeCell } from '../../../../packages/commutable';
import { dummyStore } from '../../../utils';
import Toolbar from '../../../../src/notebook/components/cell/toolbar';

const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);
const expect = chai.expect;

describe('Toolbar', () => {
  it('should be able to render a toolbar', () => {
    const toolbar = mount(
      <Toolbar />,
    );
    expect(toolbar).to.not.be.null;
    expect(toolbar.find('div.cell-toolbar').length).to.be.greaterThan(0);
  });
  it('clearOutputs does not throw error', () => {
    const toolbar = mount(
      <Toolbar />, { context: { store: dummyStore() } },
    );
    expect(() => { toolbar.instance().clearOutputs(); }).to.not.throw(Error);
  });
  it('shows "convert to code cell" menu entry for markdown type', () => {
    const toolbar = mount(
      <Toolbar type={'markdown'} />,
    );
    expect(toolbar.text()).to.contain('Convert to Code Cell');
  });
  it('shows "convert to markdown cell" menu entry for code type', () => {
    const toolbar = mount(
      <Toolbar type={'code'} />,
    );
    expect(toolbar.text()).to.contain('Convert to Markdown Cell');
  });
  it('changes "Convert to ..." menu entry on type change', () => {
    const toolbar = mount(
      <Toolbar type={'code'} />,
    );
    expect(toolbar.text()).to.contain('Convert to Markdown Cell');
    toolbar.setProps({ type: 'markdown' });
    expect(toolbar.text()).to.contain('Convert to Code Cell');
  });
});

describe('Toolbar.executeCell', () => {
  it('dispatches an executeCell action', () => {
    const cell = emptyCodeCell.set('source', 'print("sup")');
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.executeButton');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'EXECUTE_CELL',
      source: 'print("sup")',
      id: '0-1-2-3',
    });
  });
});

describe('Toolbar.removeCell', () => {
  it('dispatches a REMOVE_CELL action', () => {
    const cell = emptyCodeCell;
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.deleteButton');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'REMOVE_CELL',
      id: '0-1-2-3',
    });
  });
});

describe('Toolbar.toggleStickyCell', () => {
  it('dispatches TOGGLE_STICKY_CELL action', () => {
    const cell = emptyCodeCell;
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.stickyButton');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'TOGGLE_STICKY_CELL',
      id: '0-1-2-3',
    });
  });
});

describe('Toolbar.clearOutputs', () => {
  it('dispatches CLEAR_OUTPUTS action', () => {
    const cell = emptyCodeCell;
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} type={'code'} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.clearOutput');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'CLEAR_OUTPUTS',
      id: '0-1-2-3',
    });
  });
});

describe('Toolbar.changeInputVisibility', () => {
  it('dispatches CHANGE_INPUT_VISIBILITY action', () => {
    const cell = emptyCodeCell;
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} type={'code'} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.inputVisibility');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'CHANGE_INPUT_VISIBILITY',
      id: '0-1-2-3',
    });
  });
});

describe('Toolbar.changeOutputVisibility', () => {
  it('dispatches CHANGE_OUTPUT_VISIBILITY action', () => {
    const cell = emptyCodeCell;
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} type={'code'} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.outputVisibility');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'CHANGE_OUTPUT_VISIBILITY',
      id: '0-1-2-3',
    });
  });
});

describe('Toolbar.changeCellType', () => {
  it('dispatches CHANGE_CELL_TYPE action', () => {
    const cell = emptyCodeCell;
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.changeType');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'CHANGE_CELL_TYPE',
      id: '0-1-2-3',
      to: 'markdown',
    });
  });
});

describe('Toolbar.toggleOutputExpansion', () => {
  it('dispatches a TOGGLE_OUTPUT_EXPANSION action', () => {
    const cell = emptyCodeCell;
    const store = dummyStore();
    store.dispatch = sinon.spy();

    const toolbar = mount(
      <Toolbar id={'0-1-2-3'} cell={cell} type={'code'} />,
      { context: { store } },
    );

    const button = toolbar
      .find('.outputExpanded');

    button.simulate('click');

    expect(store.dispatch.firstCall).to.be.calledWith({
      type: 'TOGGLE_OUTPUT_EXPANSION',
      id: '0-1-2-3',
    });
  });
});
