import React from 'react';

import { expect } from 'chai';

import { shallow, mount } from 'enzyme';

import Immutable from 'immutable';

import { displayOrder, transforms } from 'transformime-react';

import {
  dummyCommutable,
} from '../dummy-nb';

import { ConnectedNotebook } from '../../../src/notebook/components/notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    const component = shallow(
      <ConnectedNotebook
        notebook={dummyCommutable}
        widgetManager={null}
        widgets={new Immutable.Map()}
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
    let cellStatuses = new Immutable.Map();
    dummyCommutable.get('cellOrder').map((cellID) => {
      cellStatuses = cellStatuses.setIn([cellID, 'outputHidden'], false)
                                .setIn([cellID, 'inputHidden'], false);
    });
    const component = mount(
      <ConnectedNotebook
        notebook={dummyCommutable}
        widgetManager={null}
        widgets={new Immutable.Map()}
        cellPagers={new Immutable.Map()}
        cellStatuses={cellStatuses}
        stickyCells={new Immutable.Map()}
        displayOrder={displayOrder.delete('text/html')}
        transforms={transforms.delete('text/html')}
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
});
