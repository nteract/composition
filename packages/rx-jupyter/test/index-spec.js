import * as jupyter from '..';
import { expect } from 'chai';

// Mostly a dummy "have we exported all the things" test
describe('rx-jupyter', () => {
  it('exports kernels and kernelspecs', () => {
    expect(jupyter.kernels).to.not.be.null;
    expect(jupyter.kernelspecs).to.not.be.null;
  })
})
