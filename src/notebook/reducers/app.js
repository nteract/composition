import * as constants from '../constants';

import {
  shutdownKernel,
} from '../api/kernel';

function cleanupKernel(state) {
  const kernel = {
    channels: state.channels,
    spawn: state.spawn,
    connectionFile: state.connectionFile,
  };
  shutdownKernel(kernel);

  const cleanState = {
    ...state,
    channels: null,
    spawn: null,
    connectionFile: null,
    executionState: 'not connected',
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
      executionState: 'starting',
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
  [constants.CHANGE_FILENAME]: function changeFilename(state, action) {
    const { filename } = action;
    if (!filename) {
      return state;
    }
    return { ...state, filename };
  },
};
