import {
  EXIT,
  KILL_KERNEL,
  NEW_KERNEL, ADD_KERNEL,
  SAVE, SAVE_AS, START_SAVING, DONE_SAVING,
  CHANGE_FILENAME,
  SET_SELECTED_CELLS,
  UPDATE_CELL_SOURCE,
  UPDATE_CELL_OUTPUTS,
  MOVE_CELL,
  EXECUTE_CELL,
  NEW_CELL_AFTER,
  REMOVE_CELL,
  START_SETTING_NOTEBOOK, SET_NOTEBOOK,
  UPDATE_CELL_EXECUTION_COUNT,
  ERROR_KERNEL_NOT_CONNECTED,
} from './constants';

export const exit = () => ({
  type: EXIT
});

export const killKernel = () => ({
  type: KILL_KERNEL
});

export const newKernel = (kernelSpecName) => ({
  type: NEW_KERNEL,
  kernelSpecName
});

export const addKernel = (kernelSpec) => ({
  type: ADD_KERNEL,
  ...kernelSpec
});

export const save = () => ({
  type: SAVE
});

export const saveAs = (filename) => ({
  type: SAVE_AS,
  filename
});

export const setNotebook = (notebook) => ({
  type: START_SETTING_NOTEBOOK,
  notebook
});

export const setSelected = (ids, additive) => ({
  type: SET_SELECTED_CELLS,
  ids,
  additive
})

export const updateCellSource = (id, source) => ({
  type: UPDATE_CELL_SOURCE,
  id,
  source
});

export const updateCellOutputs = (id, outputs) => ({
  type: UPDATE_CELL_OUTPUTS,
  id,
  outputs,
});

export const moveCell = (id, destinationId, above) => ({
  type: MOVE_CELL,
  id,
  destinationId,
  above,
});

export const removeCell = (id) => ({
  type: REMOVE_CELL,
  id,
});

export const createCellAfter = (cellType, id) => ({
  type: NEW_CELL_AFTER,
  cellType,
  id,
});

export const updateCellExecutionCount = (id, count) => ({
  type: UPDATE_CELL_EXECUTION_COUNT,
  id,
  count,
});

export const executeCell = (id, source) => ({
  type: EXECUTE_CELL,
  id,
  source
});
