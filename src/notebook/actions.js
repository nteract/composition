import Immutable from 'immutable';

import * as constants from './constants';

export function newKernel(kernelSpecName, cwd) {
  return {
    type: constants.LAUNCH_KERNEL,
    kernelSpecName,
    cwd,
  };
}

export function setNotebookKernelInfo(kernelInfo) {
  return {
    type: constants.SET_KERNEL_INFO,
    kernelInfo,
  };
}

export function setExecutionState(executionState) {
  return {
    type: constants.SET_EXECUTION_STATE,
    executionState,
  };
}

export function setNotebook(nbData, filename) {
  const data = Immutable.fromJS(nbData);
  return {
    type: constants.SET_NOTEBOOK,
    data,
    filename,
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

export function clearCellOutput(id) {
  return {
    type: constants.CLEAR_CELL_OUTPUT,
    id,
  };
}

export function changeOutputVisibility(id) {
  return {
    type: constants.CHANGE_OUTPUT_VISIBILITY,
    id,
  };
}

export function changeInputVisibility(id) {
  return {
    type: constants.CHANGE_INPUT_VISIBILITY,
    id,
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

export function toggleStickyCell(id) {
  return {
    type: constants.TOGGLE_STICKY_CELL,
    id,
  };
}

export function splitCell(id, position) {
  return {
    type: constants.SPLIT_CELL,
    id,
    position,
  };
}

export function overwriteMetadata(field, value) {
  return {
    type: constants.OVERWRITE_METADATA_FIELD,
    field,
    value,
  };
}

export const killKernel = {
  type: constants.KILL_KERNEL,
};

export const interruptKernel = {
  type: constants.INTERRUPT_KERNEL,
};

export function setNotificationSystem(notificationSystem) {
  return {
    type: constants.SET_NOTIFICATION_SYSTEM,
    notificationSystem,
  };
}

export function setWidgetState(id, state) {
  return {
    type: constants.SET_WIDGET_STATE,
    id,
    state,
  };
}

export function deleteWidget(id) {
  return {
    type: constants.DELETE_WIDGET,
    id,
  };
}

export function displayWidget(id, parentMsgId) {
  return {
    type: constants.DISPLAY_WIDGET,
    id,
    parentMsgId,
  };
}

export function clearWidgets(id) {
  return {
    type: constants.CLEAR_WIDGETS,
    id,
  };
}

export function associateCellToMsg(cellId, msgId) {
  return {
    type: constants.ASSOCIATE_CELL_TO_MSG,
    cellId,
    msgId,
  };
}

export function associateCellToMsg(cellId, msgId) {
  return {
    type: constants.ASSOCIATE_CELL_TO_MSG,
    cellId,
    msgId,
  };
}

export function setForwardCheckpoint(documentState) {
  return {
    type: constants.SET_FORWARD_CHECKPOINT,
    documentState,
  };
}

export function setBackwardCheckpoint(documentState, clearFutureStack) {
  return {
    type: constants.SET_BACKWARD_CHECKPOINT,
    documentState,
    clearFutureStack,
  };
}

export function copyCell(id) {
  return {
    type: constants.COPY_CELL,
    id,
  };
}

export function pasteCell() {
  return {
    type: constants.PASTE_CELL,
  };
}

export function changeCellType(id, to) {
  return {
    type: constants.CHANGE_CELL_TYPE,
    id,
    to,
  };
}

export function setModified(value) {
  return {
    type: constants.SET_MODIFIED,
    value,
  };
}
