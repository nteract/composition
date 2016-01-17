
import { expect } from 'chai';

import * as constants from '../src/constants';

// Solely testing the exported interface
describe('constants', () => {
  it('exports the standard Jupyter channels', () => {
    expect(constants.IOPUB).to.equal('iopub');
    expect(constants.STDIN).to.equal('stdin');
    expect(constants.SHELL).to.equal('shell');
    expect(constants.CONTROL).to.equal('control');

    expect(constants.ZMQType.frontend[constants.IOPUB])
      .to
      .equal(constants.SUB);

    expect(constants.ZMQType.frontend[constants.STDIN])
      .to
      .equal(constants.DEALER);

    expect(constants.ZMQType.frontend[constants.SHELL])
      .to
      .equal(constants.DEALER);

    expect(constants.ZMQType.frontend[constants.CONTROL])
      .to
      .equal(constants.DEALER);
  });
});
