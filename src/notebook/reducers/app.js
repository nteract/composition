import * as fs from 'fs';

import * as constants from '../constants';

function cleanupKernel(state) {
  if (state.channels) {
    state.channels.shell.complete();
    state.channels.iopub.complete();
    state.channels.stdin.complete();
  }
  if (state.spawn) {
    state.spawn.kill();
  }
  if (state.connectionFile) {
    fs.unlink(state.connectionFile);
  }

  const cleanState = {
    ...state,
    selected: null,
    channels: null,
    spawn: null,
    connectionFile: null,
  };

  return cleanState;
}

export default {
  [constants.NEW_KERNEL]: function newKernel(state, action) {
    const { channels, connectionFile, spawn } = action;

    return {
      ...cleanupKernel(state),
      channels,
      connectionFile,
      spawn,
    };
  },
  [constants.EXIT]: function exit(state) {
    return cleanupKernel(state);
  },
  [constants.KILL_KERNEL]: cleanupKernel,
  [constants.START_SAVING]: function startSaving(state) {
    return { ...state, isSaving: true };
  },
  [constants.ERROR_KERNEL_NOT_CONNECTED]: function alertKernelNotConnected(state) {
    return { ...state, error: 'Error: We\'re not connected to a runtime!' };
  },
  [constants.SET_EXECUTION_STATE]: function setExecutionState(state, action) {
    const { executionState } = action;
    return { ...state, executionState };
  },
  [constants.DONE_SAVING]: function doneSaving(state) {
    return { ...state, isSaving: false };
  },
  [constants.SET_SELECTED]: function setSelected(state, action) {
    const { id } = action;
    return { ...state, selected: id };
  },
  [constants.CHANGE_FILENAME]: function changeFilename(state, action) {
    const { filename } = action;
    if (!filename) {
      return state;
    }
    return { ...state, filename };
  },
};
