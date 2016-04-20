import React from 'react';

import {renderIntoDocument} from 'react-addons-test-utils';
import {expect} from 'chai';

import Cell from '../../../../src/notebook/components/cell/cell';
import * as commutable from 'commutable';

describe('Cell', () => {
  it('should be able to render a markdown cell', () => {
    const cell = renderIntoDocument(
      <Cell cell={commutable.emptyMarkdownCell}/>
    );
    expect(cell).to.not.be.null;
  });
});
