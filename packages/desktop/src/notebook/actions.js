import * as constants from "./constants";

export function newKernel(kernelSpec, cwd) {
  return {
    type: constants.LAUNCH_KERNEL,
    kernelSpec,
    cwd
  };
}

export function newKernelByName(kernelSpecName, cwd) {
  return {
    type: constants.LAUNCH_KERNEL_BY_NAME,
    kernelSpecName,
    cwd
  };
}

export function setNotebookKernelInfo(kernelInfo) {
  return {
    type: constants.SET_KERNEL_INFO,
    kernelInfo
  };
}

export function setExecutionState(executionState) {
  return {
    type: constants.SET_EXECUTION_STATE,
    executionState
  };
}

export function updateCellSource(id, source) {
  return {
    type: constants.UPDATE_CELL_SOURCE,
    id,
    source
  };
}

export function clearOutputs(id) {
  return {
    type: constants.CLEAR_OUTPUTS,
    id
  };
}

export function moveCell(id, destinationId, above) {
  return {
    type: constants.MOVE_CELL,
    id,
    destinationId,
    above
  };
}

export function removeCell(id) {
  return {
    type: constants.REMOVE_CELL,
    id
  };
}

export function createCellAfter(cellType, id, source) {
  return {
    type: constants.NEW_CELL_AFTER,
    source: source || "",
    cellType,
    id
  };
}

export function createCellBefore(cellType, id) {
  return {
    type: constants.NEW_CELL_BEFORE,
    cellType,
    id
  };
}

export function createCellAppend(cellType) {
  return {
    type: constants.NEW_CELL_APPEND,
    cellType
  };
}

export function mergeCellAfter(id) {
  return {
    type: constants.MERGE_CELL_AFTER,
    id
  };
}

export function updateCellExecutionCount(id, count) {
  return {
    type: constants.UPDATE_CELL_EXECUTION_COUNT,
    id,
    count
  };
}

export function changeOutputVisibility(id) {
  return {
    type: constants.CHANGE_OUTPUT_VISIBILITY,
    id
  };
}

export function changeInputVisibility(id) {
  return {
    type: constants.CHANGE_INPUT_VISIBILITY,
    id
  };
}

export function updateCellPagers(id, pagers) {
  return {
    type: constants.UPDATE_CELL_PAGERS,
    id,
    pagers
  };
}

export function updateCellStatus(id, status) {
  return {
    type: constants.UPDATE_CELL_STATUS,
    id,
    status
  };
}

export function focusCell(id) {
  return {
    type: constants.FOCUS_CELL,
    id
  };
}

export function focusNextCell(id, createCellIfUndefined) {
  return {
    type: constants.FOCUS_NEXT_CELL,
    id,
    createCellIfUndefined
  };
}

export function focusPreviousCell(id) {
  return {
    type: constants.FOCUS_PREVIOUS_CELL,
    id
  };
}

export function focusCellEditor(id) {
  return {
    type: constants.FOCUS_CELL_EDITOR,
    id
  };
}

export function focusNextCellEditor(id) {
  return {
    type: constants.FOCUS_NEXT_CELL_EDITOR,
    id
  };
}

export function focusPreviousCellEditor(id) {
  return {
    type: constants.FOCUS_PREVIOUS_CELL_EDITOR,
    id
  };
}

export function toggleStickyCell(id) {
  return {
    type: constants.TOGGLE_STICKY_CELL,
    id
  };
}

export function overwriteMetadata(field, value) {
  return {
    type: constants.OVERWRITE_METADATA_FIELD,
    field,
    value
  };
}

export function deleteMetadata(field) {
  return {
    type: constants.DELETE_METADATA_FIELD,
    field
  };
}

export const killKernel = {
  type: constants.KILL_KERNEL
};

export const interruptKernel = {
  type: constants.INTERRUPT_KERNEL
};

export function setNotificationSystem(notificationSystem) {
  return {
    type: constants.SET_NOTIFICATION_SYSTEM,
    notificationSystem
  };
}

export function setForwardCheckpoint(documentState) {
  return {
    type: constants.SET_FORWARD_CHECKPOINT,
    documentState
  };
}

export function setBackwardCheckpoint(documentState, clearFutureStack) {
  return {
    type: constants.SET_BACKWARD_CHECKPOINT,
    documentState,
    clearFutureStack
  };
}

export function copyCell(id) {
  return {
    type: constants.COPY_CELL,
    id
  };
}

export function cutCell(id) {
  return {
    type: constants.CUT_CELL,
    id
  };
}

export function pasteCell() {
  return {
    type: constants.PASTE_CELL
  };
}

export function changeCellType(id, to) {
  return {
    type: constants.CHANGE_CELL_TYPE,
    id,
    to
  };
}

export function setGithubToken(githubToken) {
  return {
    type: constants.SET_GITHUB_TOKEN,
    githubToken
  };
}

export function setConfigKey(key, value) {
  return {
    type: constants.SET_CONFIG_KEY,
    key,
    value
  };
}

export function setTheme(theme) {
  return setConfigKey("theme", theme);
}

export function setCursorBlink(value) {
  return setConfigKey("cursorBlinkRate", value);
}

export function toggleOutputExpansion(id) {
  return {
    type: constants.TOGGLE_OUTPUT_EXPANSION,
    id
  };
}

/**
 * Execute Cell action.
 *
 * @param {String} id - Universally Unique Identifier of cell to be executed.
 * @param {Object} source - Source code to executed.
 * @return {Object} executeCellAction - Action to be dispatched to reducer.
 */
export function executeCell(id, source) {
  return {
    type: constants.EXECUTE_CELL,
    id,
    source
  };
}

export function changeFilename(filename) {
  return {
    type: constants.CHANGE_FILENAME,
    filename
  };
}

export function save(filename, notebook) {
  return {
    type: constants.SAVE,
    filename,
    notebook
  };
}

export function saveAs(filename, notebook) {
  return {
    type: constants.SAVE_AS,
    filename,
    notebook
  };
}

export function doneSaving() {
  return {
    type: constants.DONE_SAVING
  };
}
