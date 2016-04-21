import { expect } from 'chai';

import reducers from '../../../src/notebook/reducers/app';

import * as constants from '../../../src/notebook/constants';

const sinon = require('sinon');

describe('reducers', () => {
  it('reduces NEW_KERNEL actions', () => {
    const reducer = reducers[constants.NEW_KERNEL];

    const shellComplete = sinon.spy();
    const iopubComplete = sinon.spy();
    const stdinComplete = sinon.spy();
    const spawnKill = sinon.spy();

    const state = {
      channels: {
        shell: {
          complete: shellComplete,
        },
        iopub: {
          complete: iopubComplete,
        },
        stdin: {
          complete: stdinComplete,
        }
      },
      spawn: {
        kill: spawnKill,
      }
    }

    const action = {
      channels: 'channels',
      connectionFile: 'connection',
      spawn: 'spawn',
    }

    const newState = reducer(state, action);

    expect(newState.channels).to.equal(action.channels);
    expect(newState.connnectionFile).to.equal(action.connectionFile);
    expect(newState.spawn).to.equal(action.spawn);

    expect(shellComplete.called).to.be.true;
    expect(iopubComplete.called).to.be.true;
    expect(stdinComplete.called).to.be.true;
    expect(spawnKill.called).to.be.true;
  })
})
