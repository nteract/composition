// @flow
import * as constants from "./constants";

import type {
  ImmutableCell,
  ImmutableNotebook,
  CellID,
  CellType,
  ImmutableCellOrder,
  ImmutableOutput,
  ImmutableOutputs,
  MimeBundle
} from "@nteract/commutable/src/types";

export function newKernel(kernelSpec: any, cwd: string) {
  return {
    type: constants.LAUNCH_KERNEL,
    kernelSpec,
    cwd
  };
}

export function newKernelByName(kernelSpecName: any, cwd: string) {
  return {
    type: constants.LAUNCH_KERNEL_BY_NAME,
    kernelSpecName,
    cwd
  };
}

export function setNotebookKernelInfo(kernelInfo: any) {
  return {
    type: constants.SET_KERNEL_INFO,
    kernelInfo
  };
}

// TODO: Lock this type down to a proper enum
export function setExecutionState(executionState: string) {
  return {
    type: constants.SET_EXECUTION_STATE,
    executionState
  };
}

export function clearOutputs(id: string) {
  return {
    type: constants.CLEAR_OUTPUTS,
    id
  };
}

// TODO: above doesn't appear to get used for a MoveCellAction
export function moveCell(id: string, destinationId: string, above: boolean) {
  return {
    type: constants.MOVE_CELL,
    id,
    destinationId,
    above
  };
}

export function removeCell(id: string) {
  return {
    type: constants.REMOVE_CELL,
    id
  };
}

export function createCellAfter(
  cellType: CellType,
  id: string,
  source: string = ""
) {
  return {
    type: constants.NEW_CELL_AFTER,
    source,
    cellType,
    id
  };
}

export function createCellBefore(cellType: CellType, id: string) {
  return {
    type: constants.NEW_CELL_BEFORE,
    cellType,
    id
  };
}

export function createCellAppend(cellType: CellType) {
  return {
    type: constants.NEW_CELL_APPEND,
    cellType
  };
}

export function mergeCellAfter(id: string) {
  return {
    type: constants.MERGE_CELL_AFTER,
    id
  };
}

/**
 * setInCell can generically be used to set any attribute on a cell, including
 * and especially for changing metadata per cell.
 * @param {CellID} id    cell ID
 * @param {Array<string>} path  path within a cell to set
 * @param {any} value what to set it to
 *
 * Example:
 *
 * > action = setInCell('123', ['metadata', 'cool'], true)
 * > documentReducer(state, action)
 * {
 *   ...
 *   '123': {
 *     'metadata': {
 *       'cool': true
 *     }
 *   }
 * }
 *
 */
export function setInCell(id: CellID, path: Array<string>, value: any) {
  return {
    type: "SET_IN_CELL",
    id,
    path,
    value
  };
}

export function updateCellSource(id: string, source: string) {
  return setInCell(id, ["source"], source);
}

export function updateCellExecutionCount(id: string, count: number) {
  return setInCell(id, ["execution_count"], count);
}

export function changeOutputVisibility(id: string) {
  return {
    type: constants.CHANGE_OUTPUT_VISIBILITY,
    id
  };
}

export function changeInputVisibility(id: string) {
  return {
    type: constants.CHANGE_INPUT_VISIBILITY,
    id
  };
}

// TODO de-anyify this signature
export function updateCellPagers(id: string, pagers: any) {
  return {
    type: constants.UPDATE_CELL_PAGERS,
    id,
    pagers
  };
}

// TODO de-anyify this signature
export function updateCellStatus(id: string, status: any) {
  return {
    type: constants.UPDATE_CELL_STATUS,
    id,
    status
  };
}

// TODO de-anyify this signature
export function focusCell(id: string) {
  return {
    type: constants.FOCUS_CELL,
    id
  };
}

export function focusNextCell(id: string, createCellIfUndefined: boolean) {
  return {
    type: constants.FOCUS_NEXT_CELL,
    id,
    createCellIfUndefined
  };
}

export function focusPreviousCell(id: string) {
  return {
    type: constants.FOCUS_PREVIOUS_CELL,
    id
  };
}

export function focusCellEditor(id: string) {
  return {
    type: constants.FOCUS_CELL_EDITOR,
    id
  };
}

export function focusNextCellEditor(id: string) {
  return {
    type: constants.FOCUS_NEXT_CELL_EDITOR,
    id
  };
}

export function focusPreviousCellEditor(id: string) {
  return {
    type: constants.FOCUS_PREVIOUS_CELL_EDITOR,
    id
  };
}

export function toggleStickyCell(id: string) {
  return {
    type: constants.TOGGLE_STICKY_CELL,
    id
  };
}

export function overwriteMetadata(field: string, value: any) {
  return {
    type: constants.OVERWRITE_METADATA_FIELD,
    field,
    value
  };
}

export function deleteMetadata(field: string) {
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

export function setNotificationSystem(notificationSystem: any) {
  return {
    type: constants.SET_NOTIFICATION_SYSTEM,
    notificationSystem
  };
}

export function copyCell(id: CellID) {
  return {
    type: constants.COPY_CELL,
    id
  };
}

export function cutCell(id: CellID) {
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

export function changeCellType(id: CellID, to: CellType) {
  return {
    type: constants.CHANGE_CELL_TYPE,
    id,
    to
  };
}

export function setGithubToken(githubToken: string) {
  return {
    type: constants.SET_GITHUB_TOKEN,
    githubToken
  };
}

export function setConfigKey(key: string, value: any) {
  return {
    type: constants.SET_CONFIG_KEY,
    key,
    value
  };
}

export function setTheme(theme: string) {
  return setConfigKey("theme", (theme: string));
}

export function setCursorBlink(value: string) {
  return setConfigKey("cursorBlinkRate", value);
}

export function toggleOutputExpansion(id: string) {
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
export function executeCell(id: string, source: string) {
  return {
    type: constants.EXECUTE_CELL,
    id,
    source
  };
}

export function changeFilename(filename: string) {
  return {
    type: constants.CHANGE_FILENAME,
    filename
  };
}

export function save(filename: string, notebook: any) {
  return {
    type: constants.SAVE,
    filename,
    notebook
  };
}

export function saveAs(filename: string, notebook: any) {
  return {
    type: constants.SAVE_AS,
    filename,
    notebook
  };
}

export function doneSaving(notebook: any) {
  return {
    type: constants.DONE_SAVING,
    notebook
  };
}
