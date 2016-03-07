import { createReducer } from 'redux-immutablejs';
import uuid from 'uuid';
import {
  updateExecutionCount,
  removeCell,
  insertCellAt,
  updateSource,
  updateOutputs,
  emptyMarkdownCell,
  emptyCodeCell
} from 'commutable';
import { fromJS, List } from 'immutable';

import {
  START_SAVING, DONE_SAVING,
  CHANGE_FILENAME,
  SET_NOTEBOOK,
  SET_SELECTED_CELLS,
  UPDATE_CELL_EXECUTION_COUNT,
  MOVE_CELL, REMOVE_CELL, NEW_CELL_AFTER,
  UPDATE_CELL_SOURCE, UPDATE_CELL_OUTPUTS
} from '../actions/constants';

const initialState = fromJS({
  current: null,
  isSaving: false,
  filename: null,
  error: null,
  selected: []
});

export default (launchData) => createReducer(initialState.merge({
  filename: launchData.filename
}), {
  [START_SAVING]: (state) => state.set('isSaving', true),
  [DONE_SAVING]: (state) => state.set('isSaving', false),
  [CHANGE_FILENAME]: (state, { filename }) => (
    filename ? state.merge({ filename }) : state
  ),
  [SET_NOTEBOOK]: (state, { data }) => state.set(
    'current',
    data
  ),
  [SET_SELECTED_CELLS]: (state, { additive, ids }) => {
    const method = additive ? 'concat' : 'set';
    return additive
      ? state.update('selected', selected => selected[method](List(ids)))
      : state.set('selected', List(ids));
  },
  [UPDATE_CELL_EXECUTION_COUNT]: (state, { id, count }) => state.update(
    'current',
    (notebook) => updateExecutionCount(notebook, id, count)
  ),
  [MOVE_CELL]: (state, action) => state.updateIn(
    ['current', 'cellOrder'],
    (cellOrder) => {
      const oldIndex = cellOrder.findIndex(id => id === action.id);
      const newIndex = cellOrder.findIndex(id => id === action.destinationId) + (action.above ? 0 : 1);
      if (oldIndex === newIndex) {
        return cellOrder;
      }
      return cellOrder
        .splice(oldIndex, 1)
        .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.id);
    }
  ),
  [REMOVE_CELL]: (state, { id }) => state.update(
    'current',
    (notebook) => removeCell(notebook, id)
  ),
  [NEW_CELL_AFTER]: (state, { cellType, id }) => state.update(
    'current',
    (notebook) => {
      // Draft API
      const { cellType, id } = action;
      const cell = cellType === 'markdown' ? emptyMarkdownCell :
                                             emptyCodeCell;
      const index = state.notebook.get('cellOrder').indexOf(id) + 1;
      const cellID = uuid.v4();

      return insertCellAt(notebook, cell, cellID, index);
    }
  ),
  [UPDATE_CELL_SOURCE]: (state, { id, source }) => state.update(
    'current',
    (notebook) => updateSource(notebook, id, source)
  ),
  [UPDATE_CELL_OUTPUTS]: (state, { id, outputs }) => state.update(
    'current',
    (notebook) => updateOutputs(notebook, id, outputs)
  )
});
