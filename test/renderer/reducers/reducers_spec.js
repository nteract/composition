import { expect } from 'chai';

import { reducers } from '../../../src/notebook/reducers';

describe('reducers', () => {
  it('has a function defined for each Symbol prop', () => {
    for (let sym of Object.getOwnPropertySymbols(reducers)) {
      expect(reducers[sym]).to.be.a.function;
    }
  });
});
