import React from 'react';

import { expect } from 'chai';

import { shallow, mount } from 'enzyme';

import Immutable from 'immutable';

import { displayOrder, transforms } from 'transformime-react';

import {
  dummyCommutable,
} from '../dummy-nb';

import Notebook from '../../../src/notebook/components/notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    const component = shallow(
      <Notebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
      />
    );
    expect(component).to.not.be.null;
  });
  it('implements the correct css spec', () => {
    const component = mount(
      <Notebook
        notebook={dummyCommutable}
        cellPagers={new Immutable.Map()}
        cellStatuses={new Immutable.Map()}
        displayOrder={displayOrder.delete('text/html')}
        transforms={transforms.delete('text/html')}
      />
    );
    expect(component.find('.notebook').length).to.be.above(0, '.notebook');
    expect(component.find('.notebook .cell').length).to.be.above(0, '.notebook .cell');
    expect(component.find('.notebook .cell.text').length).to.be.above(0, '.notebook .cell.text');
    expect(component.find('.notebook .cell.code').length).to.be.above(0, '.notebook .cell.code');
    expect(component.find('.notebook .cell.unknown').length).to.equal(0, '.notebook .cell.unknown does not exist');
    // expect(component.find('.notebook .cell.text .cell-toolbar').length).to.be.above(0, '.notebook .cell.text .cell-toolbar');
    // expect(component.find('.notebook .cell.text .input-container').length).to.be.above(0, '.notebook .cell.text .input-container');
    // expect(component.find('.notebook .cell.text .input-container .prompt').length).to.be.above(0, '.notebook .cell.text .input-container .prompt');
    // expect(component.find('.notebook .cell.text .input-container .input').length).to.be.above(0, '.notebook .cell.text .input-container .input');
    expect(component.find('.notebook .cell.text .rendered').length).to.be.above(0, '.notebook .cell.text .rendered');
    expect(component.find('.notebook .cell.code .input-container').length).to.be.above(0, '.notebook .cell.code .input-container');
    expect(component.find('.notebook .cell.code .input-container .prompt').length).to.be.above(0, '.notebook .cell.code .input-container .prompt');
    expect(component.find('.notebook .cell.code .input-container .input').length).to.be.above(0, '.notebook .cell.code .input-container .input');
    // expect(component.find('.notebook .cell.code .pagers').length).to.be.above(0, '.notebook .cell.code .pagers');
    // expect(component.find('.notebook .cell.code .pagers .pager').length).to.be.above(0, '.notebook .cell.code .pagers .pager');
    expect(component.find('.notebook .cell.code .outputs').length).to.be.above(0, '.notebook .cell.code .outputs');
    // expect(component.find('.notebook .cell-creator').length).to.be.above(0, '.notebook .cell-creator');
  });
});
