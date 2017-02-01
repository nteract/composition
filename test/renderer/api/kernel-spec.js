import chai, { expect } from 'chai';

const mock = require('mock-require');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

import {
  shutdownKernel,
  forceShutdownKernel,
  cleanupKernel,
  filesystem,
} from '../../../src/notebook/kernel/shutdown';

import reducers from '../../../src/notebook/reducers';
import * as constants from '../../../src/notebook/constants';
import { AppRecord } from '../../../src/notebook/records';

const emptyKernel = Object.freeze({
  channels: {
    shell: {},
    iopub: {},
    control: {},
    stdin: {},
  },
  spawn: {
    stdin: {},
    stdout: {},
    stderr: {},
  },
  connectionFile: '/tmp/connection.json',
});

function setupMockKernel(sandbox) {
  const kernel = Object.assign({}, emptyKernel);
  kernel.channels.shell.complete = sandbox.spy();
  kernel.channels.iopub.complete = sandbox.spy();
  kernel.channels.control.complete = sandbox.spy();
  kernel.channels.stdin.complete = sandbox.spy();

  kernel.spawn.stdin.destroy = sandbox.spy();
  kernel.spawn.stdout.destroy = sandbox.spy();
  kernel.spawn.stderr.destroy = sandbox.spy();

  kernel.spawn.kill = sandbox.spy();
  return kernel;
}

describe('forceShutdownKernel', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('fully cleans up the kernel and uses SIGKILL', () => {
    const unlinkSync = sandbox.stub(filesystem, 'unlinkSync', (path) => true);
    const kernel = setupMockKernel(sandbox);
    forceShutdownKernel(kernel);

    expect(kernel.channels.shell.complete).to.have.been.called;
    expect(kernel.channels.iopub.complete).to.have.been.called;
    expect(kernel.channels.control.complete).to.have.been.called;
    expect(kernel.channels.stdin.complete).to.have.been.called;

    expect(kernel.spawn.stdin.destroy).to.have.been.called;
    expect(kernel.spawn.stdout.destroy).to.have.been.called;
    expect(kernel.spawn.stderr.destroy).to.have.been.called;

    expect(kernel.spawn.kill).to.have.been.calledWith('SIGKILL');

    // TODO: expect kernel.connectionFile to have called out to fs
    expect(unlinkSync).to.have.been.calledWith(kernel.connectionFile);
  });
});

describe('cleanupKernel', () => {
  let sandbox;
  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('cleans out artifacts from the kernel object', () => {
    const unlinkSync = sandbox.stub(filesystem, 'unlinkSync', (path) => true);
    const kernel = setupMockKernel(sandbox);
    cleanupKernel(kernel, true);

    expect(kernel.channels.shell.complete).to.have.been.called;
    expect(kernel.channels.iopub.complete).to.have.been.called;
    expect(kernel.channels.control.complete).to.have.been.called;
    expect(kernel.channels.stdin.complete).to.have.been.called;

    expect(kernel.spawn.stdin.destroy).to.have.been.called;
    expect(kernel.spawn.stdout.destroy).to.have.been.called;
    expect(kernel.spawn.stderr.destroy).to.have.been.called;

    expect(kernel.spawn.kill).to.not.have.been.called;

    // TODO: expect kernel.connectionFile to have called out to fs
    expect(unlinkSync).to.have.been.calledWith(kernel.connectionFile);
  });
});

describe('shutdownKernel', () => {
});
