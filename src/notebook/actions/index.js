import Immutable from 'immutable';
import * as commutable from 'commutable';
import { writeFile } from 'fs';

import * as agendas from '../agendas';
import { launchKernel } from '../api/kernel';
import * as constants from '../constants';

export function exit() {
  return {
    type: constants.EXIT,
  };
}

export function setExecutionState(executionState) {
  return {
    type: constants.SET_EXECUTION_STATE,
    executionState,
  };
}

export function killKernel() {
  return {
    type: constants.KILL_KERNEL,
  };
}

export function setLanguageInfo(langInfo) {
  return {
    type: constants.SET_LANGUAGE_INFO,
    langInfo,
  };
}

export function newKernel(kernelSpecName) {
  return (subject) => {
    launchKernel(kernelSpecName)
      .then(kc => {
        const { channels, connectionFile, spawn } = kc;

        agendas.acquireKernelInfo(channels)
              .subscribe(action => {
                subject.next(action);
              });

        subject.next({
          type: constants.NEW_KERNEL,
          channels,
          connectionFile,
          spawn,
        });
      })
      .catch((err) => console.error(err));
  };
}

export function save(filename, notebook) {
  return (subject) => {
    // If there isn't a filename, save-as it instead
    if (!filename) {
      throw new Error('save needs a filename');
    }

    subject.next({
      type: constants.START_SAVING,
    });
    writeFile(filename, JSON.stringify(commutable.toJS(notebook), null, 2), (err) => {
      if (err) {
        console.error(err);
        throw err;
      }
      subject.next({
        type: constants.DONE_SAVING,
      });
    });
  };
}

export function saveAs(filename, notebook) {
  return (subject, dispatch) => {
    subject.next({
      type: constants.CHANGE_FILENAME,
      filename,
    });
    dispatch(save(filename, notebook));
  };
}

export function setNotebook(nbData) {
  return (subject, dispatch) => {
    const data = Immutable.fromJS(nbData);
    subject.next({
      type: constants.SET_NOTEBOOK,
      data,
    });

    // Get the kernel name from the kernelspec, fallback on language_info, and
    // in the worse case scenario spawn a Python 3 kernel.
    const kernelName = data.getIn([
      'metadata', 'kernelspec', 'name',
    ], data.getIn([
      'metadata', 'language_info', 'name',
    ], 'python3'));
    dispatch(newKernel(kernelName));
  };
}

export function updateCellSource(id, source) {
  return {
    type: constants.UPDATE_CELL_SOURCE,
    id,
    source,
  };
}

export function updateCellOutputs(id, outputs) {
  return {
    type: constants.UPDATE_CELL_OUTPUTS,
    id,
    outputs,
  };
}

export function moveCell(id, destinationId, above) {
  return {
    type: constants.MOVE_CELL,
    id,
    destinationId,
    above,
  };
}

export function removeCell(id) {
  return {
    type: constants.REMOVE_CELL,
    id,
  };
}

export function createCellAfter(cellType, id) {
  return {
    type: constants.NEW_CELL_AFTER,
    cellType,
    id,
  };
}

export function createCellBefore(cellType, id) {
  return {
    type: constants.NEW_CELL_BEFORE,
    cellType,
    id,
  };
}

export function createCellAppend(cellType) {
  return {
    type: constants.NEW_CELL_APPEND,
    cellType,
  };
}

export function updateCellExecutionCount(id, count) {
  return {
    type: constants.UPDATE_CELL_EXECUTION_COUNT,
    id,
    count,
  };
}

export function executeCell(channels, id, source) {
  return (subject) => {
    const obs = agendas.executeCell(channels, id, source);
    obs.subscribe(action => {
      subject.next(action);
    }, (error) => {
      subject.next({ type: constants.ERROR_KERNEL_NOT_CONNECTED, message: error });
    });
  };
}

export function setSelected(id) {
  return {
    type: constants.SET_SELECTED,
    id,
  };
}
