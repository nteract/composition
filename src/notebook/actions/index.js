const path = require('path');

import Immutable from 'immutable';
import * as commutable from 'commutable';
import { writeFile } from 'fs';

import * as agendas from '../agendas';
import { launchKernel } from '../api/kernel';
import * as constants from '../constants';

import Rx from 'rxjs/Rx';

export function setExecutionState(executionState) {
  return {
    type: constants.SET_EXECUTION_STATE,
    executionState,
  };
}

export function setLanguageInfo(langInfo) {
  return {
    type: constants.SET_LANGUAGE_INFO,
    langInfo,
  };
}

export function newKernel(kernelSpecName, cwd) {
  return () => Rx.Observable.create((subscriber) => {
    launchKernel(kernelSpecName, { cwd })
      .then(kc => {
        const { channels, connectionFile, spawn } = kc;

        // Listen to the execution status of the kernel
        channels.iopub
          .filter(msg => msg.header.msg_type === 'status')
          .map(msg => msg.content.execution_state)
          .subscribe(() => subscriber.next(setExecutionState('idle')));

        agendas.acquireKernelInfo(channels)
              .subscribe(action => {
                subscriber.next(action);
                subscriber.next(setExecutionState('idle'));
              });

        subscriber.next({
          type: constants.NEW_KERNEL,
          channels,
          connectionFile,
          spawn,
          kernelSpecName,
        });
      })
      .catch((err) => console.error(err));
  });
}

export function save(filename, notebook) {
  return () => Rx.Observable.create((subscriber) => {
    // If there isn't a filename, save-as it instead
    if (!filename) {
      throw new Error('save needs a filename');
    }

    subscriber.next({
      type: constants.START_SAVING,
    });
    writeFile(filename, JSON.stringify(commutable.toJS(notebook), null, 1), (err) => {
      if (err) {
        console.error(err);
        throw err;
      }
      subscriber.next({
        type: constants.DONE_SAVING,
      });
    });
  });
}

export function saveAs(filename, notebook) {
  return (actions, store) => Rx.Observable.create((subscriber) => {
    subscriber.next({
      type: constants.CHANGE_FILENAME,
      filename,
    });
    store.dispatch(save(filename, notebook));
  });
}

export function setNotebook(nbData, filename) {
  const cwd = (filename && path.dirname(path.resolve(filename))) || process.cwd();
  return (actions, store) => Rx.Observable.create((subscriber) => {
    const data = Immutable.fromJS(nbData);
    subscriber.next({
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
    store.dispatch(newKernel(kernelName, cwd));
  });
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

export function createCellAfter(cellType, id, source) {
  return {
    type: constants.NEW_CELL_AFTER,
    source: source || '',
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

export function mergeCellAfter(id) {
  return {
    type: constants.MERGE_CELL_AFTER,
    id,
  };
}

export function updateCellExecutionCount(id, count) {
  return {
    type: constants.UPDATE_CELL_EXECUTION_COUNT,
    id,
    count,
  };
}

export function updateCellPagers(id, pagers) {
  return {
    type: constants.UPDATE_CELL_PAGERS,
    id,
    pagers,
  };
}

export function updateCellStatus(id, status) {
  return {
    type: constants.UPDATE_CELL_STATUS,
    id,
    status,
  };
}

export function focusCell(id) {
  return {
    type: constants.FOCUS_CELL,
    id,
  };
}

export function focusNextCell(id, createCellIfUndefined) {
  return {
    type: constants.FOCUS_NEXT_CELL,
    id,
    createCellIfUndefined,
  };
}

export function focusPreviousCell(id) {
  return {
    type: constants.FOCUS_PREVIOUS_CELL,
    id,
  };
}

export function executeCell(channels, id, source, kernelConnected, notificationSystem) {
  return (actions, store) => Rx.Observable.create((subscriber) => {
    if (!kernelConnected) {
      notificationSystem.addNotification({
        title: 'Could not execute cell',
        message: 'The cell could not be executed because the kernel is not connected.',
        level: 'error',
      });
      store.dispatch(updateCellExecutionCount(id, undefined));
      return;
    }

    const obs = agendas.executeCell(channels, id, source);
    obs.subscribe(action => {
      subscriber.next(action);
    }, (error) => {
      subscriber.next({ type: constants.ERROR_KERNEL_NOT_CONNECTED, message: error });
    });
  });
}

export function clearCell(channels, id) {
  return (actions, store ) => Rx.Observable.create((subscriber) => {
    const obs = agendas.clearCell(channels, id);
    obs.subscribe(action => {
      subscriber.next(action);
    }, (error) => {
      subscriber.next({ type: constants.ERROR_KERNEL_NOT_CONNECTED, message: error });
    });
  });
}

export function overwriteMetadata(field, value) {
  return {
    type: constants.OVERWRITE_METADATA_FIELD,
    field,
    value,
  };
}

export const startedUploading = {
  type: constants.STARTED_UPLOADING,
};

export const doneUploading = {
  type: constants.DONE_UPLOADING,
};

export const killKernel = {
  type: constants.KILL_KERNEL,
};

export function setNotificationSystem(notificationSystem) {
  return {
    type: constants.SET_NOTIFICATION_SYSTEM,
    notificationSystem,
  };
}
