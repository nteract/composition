import * as fs from 'fs';

import * as commutable from 'commutable';

import { v4 as uuid } from 'node-uuid';

import {
  CHANGE_FILENAME,
  DONE_SAVING,
  EXIT,
  KILL_KERNEL,
  MOVE_CELL,
  NEW_CELL_AFTER,
  NEW_KERNEL,
  READ_NOTEBOOK,
  SET_SELECTED,
  START_SAVING,
  UPDATE_CELL_EXECUTION_COUNT,
  UPDATE_CELL_OUTPUTS,
  UPDATE_CELL_SOURCE,
  ERROR_KERNEL_NOT_CONNECTED,
  SET_FOCUSED,
  NEXT_CELL,
} from '../actions/constants';

import {
  loadNotebook,
  updateExecutionCount,
  moveCell,
  newCellAfter,
  updateSource,
  updateOutputs,
} from './document';

export const reducers = {};

reducers[READ_NOTEBOOK] = loadNotebook;
reducers[UPDATE_CELL_EXECUTION_COUNT] = updateExecutionCount;
reducers[NEW_CELL_AFTER] = newCellAfter;
reducers[UPDATE_CELL_SOURCE] = updateSource;
reducers[UPDATE_CELL_OUTPUTS] = updateOutputs;
reducers[MOVE_CELL] = moveCell;

reducers[NEXT_CELL] = function nextCell(state, action) {
  // If the next cell doesn't exist, create a new one
  let { notebook } = state;
  const { id } = action;

  const cellOrder = notebook.get('cellOrder');

  const priorIndex = cellOrder.indexOf(id);

  let focused = cellOrder[priorIndex + 1];

  if(priorIndex === -1 || // What does this behavior mean?
     priorIndex === cellOrder.size - 1) {
    // Here we'll create a new cell at the end of the document
    // create a new cell
    const cell = commutable.emptyCodeCell; // Until configurable

    // This is another time where I wish I could either tell appendCell
    // what cellID I want or for it to return one to me
    // notebook = commutable.appendCell(notebook, cell);
    // doing it here, then writing the idiomatic clean interface later
    // When writing tests, I ran into this too as the cell ID was wrapped
    // in a closure and had to be extracted by "knowing" where the next cell was
    const cellID = uuid();
    notebook = notebook.setIn(['cellMap', cellID], cell)
                       .set('cellOrder',
                            notebook.get('cellOrder').push(cellID));
    focused = cellID;
  }

  // Now switch focus to that one
  return Object.assign({}, state, {
    notebook,
    focused,
  });
};

reducers[SET_SELECTED] = function setSelected(state, action) {
  const selected = action.additive ?
      state.selected.concat(action.ids) :
      action.ids;
  return Object.assign({}, state, {
    selected,
  });
};

reducers[SET_FOCUSED] = function setFocused(state, action) {
  const focused = action.id;
  return Object.assign({}, state, {
    focused,
  });
};

function cleanupKernel(state) {
  if (state.channels) {
    state.channels.shell.complete();
    state.channels.iopub.complete();
    state.channels.stdin.complete();
    state.channels = null;
  }
  if (state.spawn) {
    state.spawn.kill();
    state.spawn = null;
  }
  if (state.connectionFile) {
    fs.unlink(state.connectionFile);
    state.connectionFile = null;
  }

  delete state.channels;
  delete state.spawn;
  delete state.connectionFile;
  return state;
}

reducers[NEW_KERNEL] = function newKernel(state, action) {
  const { channels, connectionFile, spawn } = action;

  // cleanup old kernels first
  state = cleanupKernel(state);

  state.channels = channels;
  state.connectionFile = connectionFile;
  state.spawn = spawn;
  return state;
};

reducers[EXIT] = function exit(state) {
  return cleanupKernel(state);
};

reducers[KILL_KERNEL] = cleanupKernel;

reducers[START_SAVING] = function startSaving(state) {
  return Object.assign({}, state, { isSaving: true });
};

reducers[ERROR_KERNEL_NOT_CONNECTED] = function alertKernelNotConnected(state) {
  return Object.assign({}, state, { error: 'Error: We\'re not connected to a runtime!' });
};

reducers[DONE_SAVING] = function doneSaving(state) {
  return Object.assign({}, state, { isSaving: false });
};

reducers[CHANGE_FILENAME] = function changeFilename(state, action) {
  const { filename } = action;
  if(!filename) {
    return state;
  }
  return Object.assign({}, state, { filename });
};
