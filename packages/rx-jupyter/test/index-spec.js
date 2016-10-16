import { expect } from 'chai';

import * as jupyter from '..';

// Mostly a dummy "have we exported all the things" test
describe('rx-jupyter', () => {
  it('exports kernels and kernelspecs', () => {
    expect(jupyter.kernels).to.not.be.null; // eslint-disable-line no-unused-expressions
    expect(jupyter.kernelspecs).to.not.be.null; // eslint-disable-line no-unused-expressions
  });
});
