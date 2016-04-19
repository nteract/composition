import React from 'react';

import { expect } from 'chai';

import Immutable from 'immutable';

import {
  renderIntoDocument,
} from 'react-addons-test-utils';

import {
  dummyCommutable,
} from '../dummy-nb';

import Notebook from '../../../src/notebook/components/notebook';

// Boilerplate test to make sure the testing setup is configured
describe('Notebook', () => {
  it('accepts an Immutable.List of cells', () => {
    const component = renderIntoDocument(
      <Notebook notebook={dummyCommutable} cellPagers={new Immutable.Map()} />
    );
    expect(component).to.not.be.null;
  });
});
