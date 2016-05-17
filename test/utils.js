import { expect } from 'chai';
import Immutable from 'immutable';
import Github from 'github4';
import {
  emptyNotebook,
  emptyCodeCell,
  appendCell,
} from 'commutable';

import { shutdownKernel } from '../src/notebook/api/kernel';
import * as actions from '../src/notebook/actions';
import { getEntries } from '../src/notebook/performance';
import createStore from '../src/notebook/store';
import { reducers } from '../src/notebook/reducers';
import { acquireKernelInfo } from '../src/notebook/agendas';

export function dispatchQueuePromise(dispatch) {
  return new Promise(resolve => {
    dispatch(() => {
      resolve();
    });
  });
}

function waitFor(cb) {
  return new Promise(resolve => {
    function _waitFor() {
      if (cb()) {
        resolve();
      } else {
        setTimeout(_waitFor, 100);
      }
    }
    _waitFor();
  });
}

function waitForKernel(store) {
  return waitFor(() => {
    const language_info = store.getState().notebook.getIn(['metadata', 'language_info']);
    const spawn = store.getState().spawn;
    const kernelState = store.getState().executionState;
    return spawn && language_info && kernelState === 'idle';
  });
}

export function waitForOutputs(store, cellId) {
  return waitFor(() => {
    const outputs = store.getState().notebook.getIn(['cellMap', cellId, 'outputs'], []);
    return outputs.count() > 0;
  });
}

export function liveStore(cb, kernelName='python2') {
  const github = new Github();
  const notebook = appendCell(emptyNotebook, emptyCodeCell).setIn([
    'metadata', 'kernelspec', 'name',
  ], kernelName);
  const { store, dispatch } = createStore({
    notebook,
    cellPagers: new Immutable.Map(),
    cellStatuses: new Immutable.Map(),
    executionState: 'not connected',
    github,
  }, reducers);

  dispatch(actions.setNotebook(notebook, ''));

  const kernel = {};
  return dispatchQueuePromise(dispatch)
    .then(() => waitForKernel(store))
    .then(() => {
      const state = store.getState();
      kernel.channels = state.channels;
      kernel.spawn = state.spawn;
      kernel.connectionFile = state.connectionFile;
      expect(kernel.channels).to.not.be.undefined;
    })
    .then(() => Promise.resolve(cb(kernel, dispatch, store)))
    .then(() => dispatchQueuePromise(dispatch))
    .then(() => shutdownKernel(kernel).then(() => {
      expect(kernel.channels).to.be.undefined;
    })
  );
}
