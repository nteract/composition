import { expect } from 'chai';
import Immutable from 'immutable';
import Github from 'github';
import {
  emptyNotebook,
  emptyCodeCell,
  appendCell,
} from 'commutable';

import { shutdownKernel } from '../src/notebook/kernel/shutdown';
import * as actions from '../src/notebook/actions';
import createStore from '../src/notebook/store';
import { reducers } from '../src/notebook/reducers';
import { acquireKernelInfo } from '../src/notebook/epics/kernelLaunch';
import { WidgetManager } from '../src/notebook/widgets/manager';

import { AppRecord, DocumentRecord, MetadataRecord } from '../src/notebook/records';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../src/notebook/kernel/messaging';

const sinon = require('sinon');

export function dispatchQueuePromise(dispatch) {
  return new Promise(resolve => {
    resolve();
  });
}

export function waitFor(cb) {
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
    const language_info = store.getState().document.getIn(['notebook', 'metadata', 'language_info']);
    const spawn = store.getState().app.spawn;
    const kernelState = store.getState().app.executionState;
    return spawn && language_info && kernelState === 'idle';
  });
}

export function waitForOutputs(store, cellId, count=1) {
  return waitFor(() => {
    const outputs = store.getState().document.getIn(['notebook', 'cellMap', cellId, 'outputs'], []);
    return outputs.count() >= count;
  });
}

function validateKernel(store) {
  const state = store.getState();
  const { iopub, shell } = state.app.channels;
  const executeRequest = createExecuteRequest('print("started")');
  const iopubChildren = iopub.childOf(executeRequest).share();

  const responsePromise = iopubChildren
    .ofMessageType(['stream'])
    .map(msgSpecToNotebookFormat)
    .map(output => output.text)
    .filter(text => text === 'started\n')
    .map(() => true)
    .first()
    .timeout(500)
    .toPromise()
    .catch(() => false);

  const shellSubscription = shell.subscribe(() => {});
  shell.next(executeRequest);
  shellSubscription.unsubscribe();

  return responsePromise;
}

function relaunchKernel(store) {
  const state = store.getState();
  const spawnOptions = {};
  if (state && state.document && state.metadata.get('filename')) {
    spawnOptions.cwd = path.dirname(path.resolve(state.metadata.filename));
  }

  store.dispatch(actions.killKernel);
  store.dispatch(actions.newKernel(state.app.kernelSpecName, spawnOptions));
  return dispatchQueuePromise(store.dispatch)
    .then(() => new Promise(resolve => setTimeout(resolve, 100)))
    .then(() => waitForKernel(store));
}

function launchKernel(store, notebook, retries=2) {
  store.dispatch(actions.setNotebook(notebook, ''));
  return dispatchQueuePromise(store.dispatch)
    // TODO: Remove hack
    // HACK: Wait 100ms before executing a cell because kernel ready and idle
    // aren't enough.  There must be another signal that we need to listen to.
    .then(() => new Promise(resolve => setTimeout(resolve, 100)))
    .then(() => waitForKernel(store))
    .then(() => {
      let validation = validateKernel(store);
      let attempts = 0;
      while (attempts < retries) {
        attempts += 1;
        validation = validation.then(valid => {
          if (!valid) {
            console.error('Launched kernel is unresponsive, trying again...');
            return relaunchKernel(store).then(() => validateKernel(store));
          }
          return true;
        });
      }
      return validation;
    });
}

export function dummyStore() {
  const notebook = appendCell(emptyNotebook, emptyCodeCell).setIn([
    'metadata', 'kernelspec', 'name',
  ], 'python2');
  return createStore({
    document: {
      past: [],
      present: DocumentRecord({
        notebook,
        cellPagers: new Immutable.Map(),
        cellStatuses: new Immutable.Map(),
        stickyCells: new Immutable.Map(),
        cellMsgAssociations: new Immutable.Map(),
        msgCellAssociations: new Immutable.Map(),
        outputStatuses: new Immutable.Map(),
      }),
      future: [],
    },
    app: AppRecord({
      executionState: 'not connected',
      notificationSystem: {
        addNotification: sinon.spy(),
      }
    }),
    metadata: MetadataRecord({
      filename: 'dummy-store-nb.ipynb',
      past: new Immutable.List(),
      future: new Immutable.List(),
    }),
  }, reducers);
}

export function liveStore(cb, kernelName='python2') {
  window.disableMathJax = true;

  const github = new Github();
  const notebook = appendCell(emptyNotebook, emptyCodeCell).setIn([
    'metadata', 'kernelspec', 'name',
  ], kernelName);
  const store = createStore({
    document: DocumentRecord({
      notebook,
      cellPagers: new Immutable.Map(),
      cellStatuses: new Immutable.Map(),
      stickyCells: new Immutable.Map(),
      widgets: new Immutable.Map({
        widgetViews: new Immutable.Map(),
        widgetModels: new Immutable.Map(),
      }),
      cellMsgAssociations: new Immutable.Map(),
      msgCellAssociations: new Immutable.Map(),
      outputStatuses: new Immutable.Map(),
    }),
    app: AppRecord({
      executionState: 'not connected',
      github,
    })
  }, reducers);

  const widgetManager = new WidgetManager(store);
  const kernel = {};
  return launchKernel(store, notebook)
    .then(() => {
      const state = store.getState();
      kernel.channels = state.app.channels;
      kernel.spawn = state.app.spawn;
      kernel.connectionFile = state.app.connectionFile;
      expect(kernel.channels).to.not.be.undefined;
    })
    .then(() => Promise.resolve(cb(kernel, store.dispatch, store)))
    .then(() => dispatchQueuePromise(store.dispatch))
    .then(() => shutdownKernel(kernel).then(() => {
      expect(kernel.channels).to.be.undefined;
    })
  );
}
