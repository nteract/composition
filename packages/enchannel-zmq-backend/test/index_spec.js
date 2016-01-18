import { expect } from 'chai';

import {
  createControlSubject,
  createStdinSubject,
  createIOPubSubject,
  createShellSubject,
} from '..';

// Solely testing the exported interface on the built ES5 JavaScript
describe('the built version of enchannel-zmq-backend', () => {
  it('exports create helpers for control, stdin, iopub, and shell', () => {
    expect(createControlSubject).to.not.be.undefined;
    expect(createStdinSubject).to.not.be.undefined;
    expect(createIOPubSubject).to.not.be.undefined;
    expect(createShellSubject).to.not.be.undefined;
  });
});
