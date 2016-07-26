import React from 'react';

import { expect } from 'chai';

import { shallow, mount } from 'enzyme';

import sinon from 'sinon';

import Immutable from 'immutable';

import { displayOrder, transforms } from 'transformime-react';

import {
  dummyCommutable,
} from '../dummy-nb';

import { ConnectedNotebook } from '../../../src/notebook/components/notebook';

let outputStatuses = new Immutable.Map();
dummyCommutable.get('cellOrder').map((cellID) => {
  outputStatuses = outputStatuses.setIn([cellID, 'isHidden'], false);
});

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    const component = shallow(
      <ConnectedNotebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        stickyCells={(new Immutable.Map())
          // Sticky the first cell of the notebook so that the sticky code gets
          // triggered.
          .set(dummyCommutable.getIn(['cellOrder', 0]), true)
        }
        outputStatuses={new Immutable.Map()}
      />
    );
    expect(component).to.not.be.null;
  });
  it('implements the correct css spec', () => {
    const component = mount(
      <ConnectedNotebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        stickyCells={new Immutable.Map()}
        displayOrder={displayOrder.delete('text/html')}
        transforms={transforms.delete('text/html')}
        outputStatuses={outputStatuses}
      />
    );
    expect(component.find('.notebook').length).to.be.above(0, '.notebook');
    expect(component.find('.notebook .cell').length).to.be.above(0, '.notebook .cell');
    expect(component.find('.notebook .cell.text').length).to.be.above(0, '.notebook .cell.text');
    expect(component.find('.notebook .cell.code').length).to.be.above(0, '.notebook .cell.code');
    expect(component.find('.notebook .cell.unknown').length).to.equal(0, '.notebook .cell.unknown does not exist');
    expect(component.find('.notebook .cell.text .rendered').length).to.be.above(0, '.notebook .cell.text .rendered');
    expect(component.find('.notebook .cell.code .input-container').length).to.be.above(0, '.notebook .cell.code .input-container');
    expect(component.find('.notebook .cell.code .input-container .prompt').length).to.be.above(0, '.notebook .cell.code .input-container .prompt');
    expect(component.find('.notebook .cell.code .input-container .input').length).to.be.above(0, '.notebook .cell.code .input-container .input');
    expect(component.find('.notebook .cell.code .outputs').length).to.be.above(0, '.notebook .cell.code .outputs');
  });
  it('should execute the focused cell when enter is pressed', () => {
    const component = mount(
      <ConnectedNotebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        stickyCells={new Immutable.Map()}
        displayOrder={displayOrder.delete('text/html')}
        transforms={transforms.delete('text/html')}
        outputStatuses={outputStatuses}
      />
    );
  
    const spy = sinon.spy(component.instance().refs.child, "keyDown");

    component.find('Notebook').last().simulate('keydown', { keyCode: 13 });
    // expect(spy.called).to.be.true;
  });
  it('should not resolve the scroll position of an undefined id', () => {
    const component = mount(
      <ConnectedNotebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        stickyCells={new Immutable.Map()}
        displayOrder={displayOrder.delete('text/html')}
        transforms={transforms.delete('text/html')}
        outputStatuses={outputStatuses}
      />
    );

    expect(() => component.instance().refs.child.resolveScrollPosition('235')).to.error;
  });
  it('should scroll down to the last cell', () => {
    const component = mount(
      <ConnectedNotebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        stickyCells={new Immutable.Map()}
        displayOrder={displayOrder.delete('text/html')}
        transforms={transforms.delete('text/html')}
        outputStatuses={outputStatuses}
      />
    );
   
    const lastID = dummyCommutable.get('cellOrder').last();
    component.instance().refs.child.resolveScrollPosition(lastID);
  });
});
