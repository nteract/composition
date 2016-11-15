import { expect } from 'chai';
import Immutable from 'immutable';
import {
  emptyNotebook,
  emptyCodeCell,
  appendCell,
} from 'commutable';

import { shutdownKernel } from '../src/notebook/kernel/shutdown';
import * as actions from '../src/notebook/actions';
import createStore from '../src/notebook/store';
import { reducers } from '../src/notebook/reducers';
import { acquireKernelInfo } from '../src/notebook/epics/kernel-launch';

import { AppRecord, DocumentRecord, MetadataRecord, ConfigRecord } from '../src/notebook/records';

import {
  createExecuteRequest,
  msgSpecToNotebookFormat,
} from '../src/notebook/kernel/messaging';

const sinon = require('sinon');

/**
 * Creates a dummy notebook for Redux state for testing.
 * 
 * @param {object} config - Configuration options for notebook
 * config.codeCellCount (number) - Number of empty code cells to be in notebook.
 * config.markdownCellCount (number) - Number of empty markdown cells to be in notebook.
 * config.hideAll (boolean) - Hide all cells in notebook
 * @returns {object} - A notebook for {@link DocumentRecord} for Redux store. 
 * Created using the config object passed in.
 */
function buildDummyNotebook(config) {
  let notebook = appendCell(emptyNotebook, emptyCodeCell).setIn([
    'metadata', 'kernelspec', 'name',
  ], 'python2');

  if (config) {

    if (config.codeCellCount) {
      for (let i=1; i < config.codeCellCount; i++) {
        notebook = appendCell(notebook, emptyCodeCell);
      }
    }

    if (config.markdownCellCount){
      for (let i=0; i < config.markdownCellCount; i++) {
        notebook = appendCell(notebook, emptyCodeCell.set('cell_type', 'markdown'));
      }
    }

    if (config.hideAll) {
      notebook = hideCells(notebook)
    }
  }

  return notebook;
}

function hideCells(notebook) {
  return notebook
    .update('cellMap', (cells) => notebook
      .get('cellOrder')
      .reduce((acc, id) => acc.setIn([id, 'metadata', 'inputHidden'], true), cells));
}

export function dummyStore(config) {
  const dummyNotebook = buildDummyNotebook(config);

  return createStore({
    document: DocumentRecord({
      notebook: dummyNotebook,
      cellPagers: new Immutable.Map(),
      stickyCells: new Immutable.Map(),
      outputStatuses: new Immutable.Map(),
      cellFocused: (config && config.codeCellCount > 1) ? dummyNotebook.get('cellOrder').get(1) : null,
    }),
    app: AppRecord({
      executionState: 'not connected',
      notificationSystem: {
        addNotification: sinon.spy(),
      },
      token: 'TOKEN',
      channels: 'channelInfo',
    }),
    metadata: MetadataRecord({
      filename: (config && config.noFilename) ? null : 'dummy-store-nb.ipynb',
      past: new Immutable.List(),
      future: new Immutable.List(),
    }),
    config: new Immutable.Map({
      theme: 'light',
    })
  }, reducers);
}
