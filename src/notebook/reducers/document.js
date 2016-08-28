import Immutable from 'immutable';
import { handleActions } from 'redux-actions';
import * as uuid from 'uuid';
import * as commutable from 'commutable';

import * as constants from '../constants';
import widgets from './widgets';

export default handleActions(Object.assign({
  [constants.SET_NOTEBOOK]: function setNotebook(state, action) {
    const notebook = action.data;
    let cellStatuses = new Immutable.Map();
    notebook.get('cellOrder').map((cellID) => {
      cellStatuses = cellStatuses.setIn([cellID, 'outputHidden'], false)
        .setIn([cellID, 'inputHidden'], false);
      return cellStatuses;
    });

    return state.set('notebook', notebook)
      .set('focusedCell', notebook.getIn(['cellOrder', 0]))
      .set('cellStatuses', cellStatuses);
  },
  [constants.FOCUS_CELL]: function focusCell(state, action) {
    return state.set('focusedCell', action.id);
  },
  [constants.FOCUS_NEXT_CELL]: function focusNextCell(state, action) {
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const curIndex = cellOrder.findIndex(id => id === action.id);

    const nextIndex = curIndex + 1;

    // When at the end, create a new cell
    if (nextIndex >= cellOrder.size) {
      if (!action.createCellIfUndefined) {
        return state;
      }

      const cellID = uuid.v4();
      // TODO: condition on state.defaultCellType (markdown vs. code)
      const cell = commutable.emptyCodeCell;
      return state.set('focusedCell', cellID)
        .update('notebook',
          (notebook) => commutable.insertCellAt(notebook, cell, cellID, nextIndex))
        .setIn(['cellStatuses', cellID, 'outputHidden'], false)
        .setIn(['cellStatuses', cellID, 'inputHidden'], false);
    }

    // When in the middle of the notebook document, move to the next cell
    return state.set('focusedCell', cellOrder.get(nextIndex));
  },
  [constants.FOCUS_PREVIOUS_CELL]: function focusPreviousCell(state, action) {
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const curIndex = cellOrder.findIndex(id => id === action.id);
    const nextIndex = Math.max(0, curIndex - 1);

    return state.set('focusedCell', cellOrder.get(nextIndex));
  },
  [constants.TOGGLE_STICKY_CELL]: function toggleStickyCell(state, action) {
    const { id } = action;
    // TODO: Switch this structure to an Immutable.Set
    const stickyCells = state.get('stickyCells');
    if (stickyCells.get(id)) {
      return state.set('stickyCells', stickyCells.delete(id));
    }
    return state.setIn(['stickyCells', id], true);
  },
  [constants.UPDATE_CELL_EXECUTION_COUNT]: function updateExecutionCount(state, action) {
    const { id, count } = action;
    return state.update('notebook',
      (notebook) => commutable.updateExecutionCount(notebook, id, count));
  },
  [constants.MOVE_CELL]: function moveCell(state, action) {
    return state.updateIn(['notebook', 'cellOrder'],
      cellOrder => {
        const oldIndex = cellOrder.findIndex(id => id === action.id);
        const newIndex = cellOrder.findIndex(id => id === action.destinationId)
                          + (action.above ? 0 : 1);
        if (oldIndex === newIndex) {
          return cellOrder;
        }
        return cellOrder
          .splice(oldIndex, 1)
          .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.id);
      }
    );
  },
  [constants.REMOVE_CELL]: function removeCell(state, action) {
    const { id } = action;
    return state.update('notebook',
      (notebook) => commutable.removeCell(notebook, id)
    );
  },
  [constants.NEW_CELL_AFTER]: function newCellAfter(state, action) {
    const { cellType, id, source } = action;
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const cellID = uuid.v4();
    return state.update('notebook', (notebook) => {
      const index = notebook.get('cellOrder').indexOf(id) + 1;
      return commutable.insertCellAt(notebook, cell.set('source', source), cellID, index);
    })
      .setIn(['cellStatuses', cellID, 'outputHidden'], false)
      .setIn(['cellStatuses', cellID, 'inputHidden'], false);
  },
  [constants.NEW_CELL_BEFORE]: function newCellBefore(state, action) {
    // Draft API
    const { cellType, id } = action;
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const cellID = uuid.v4();
    return state.update('notebook', (notebook) => {
      const index = notebook.get('cellOrder').indexOf(id);
      return commutable.insertCellAt(notebook, cell, cellID, index);
    })
      .setIn(['cellStatuses', cellID, 'outputHidden'], false)
      .setIn(['cellStatuses', cellID, 'inputHidden'], false);
  },
  [constants.MERGE_CELL_AFTER]: function mergeCellAfter(state, action) {
    const { id } = action;
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const index = cellOrder.indexOf(id);
    // do nothing if this is the last cell
    if (cellOrder.size === index + 1) {
      return state;
    }
    const cellMap = state.getIn(['notebook', 'cellMap']);

    const nextId = cellOrder.get(index + 1);
    const source = cellMap.getIn([id, 'source'])
      .concat('\n', '\n', cellMap.getIn([nextId, 'source']));

    return state.update('notebook',
      (notebook) => commutable.removeCell(commutable.updateSource(notebook, id, source), nextId)
    );
  },
  [constants.NEW_CELL_APPEND]: function newCellAppend(state, action) {
    // Draft API
    const { cellType } = action;
    const notebook = state.get('notebook');
    const cell = cellType === 'markdown' ? commutable.emptyMarkdownCell :
                                           commutable.emptyCodeCell;
    const index = notebook.get('cellOrder').count();
    const cellID = uuid.v4();
    return state.set('notebook', commutable.insertCellAt(notebook, cell, cellID, index))
      .setIn(['cellStatuses', cellID, 'outputHidden'], false)
      .setIn(['cellStatuses', cellID, 'inputHidden'], false);
  },
  [constants.UPDATE_CELL_SOURCE]: function updateSource(state, action) {
    const { id, source } = action;
    return state.update('notebook', (notebook) => commutable.updateSource(notebook, id, source));
  },
  [constants.CLEAR_CELL_OUTPUT]: function clearCellOutput(state, action) {
    const { id } = action;
    return state.update('notebook', (notebook) => commutable.clearCellOutput(notebook, id));
  },
  [constants.SPLIT_CELL]: function splitCell(state, action) {
    const { id, position } = action;
    const index = state.getIn(['notebook', 'cellOrder']).indexOf(id);
    const updatedState = state.update('notebook',
        (notebook) => commutable.splitCell(notebook, id, position));
    const newCell = updatedState.getIn(['notebook', 'cellOrder', index + 1]);
    return updatedState
      .setIn(['cellStatuses', newCell, 'outputHidden'], false)
      .setIn(['cellStatuses', newCell, 'inputHidden'], false);
  },
  [constants.CHANGE_OUTPUT_VISIBILITY]: function changeOutputVisibility(state, action) {
    const { id } = action;
    return state.update('cellStatuses', (cellStatuses) => cellStatuses.setIn([id, 'outputHidden'],
          !cellStatuses.getIn([id, 'outputHidden'])));
  },
  [constants.CHANGE_INPUT_VISIBILITY]: function changeInputVisibility(state, action) {
    const { id } = action;
    return state.update('cellStatuses', (cellStatuses) => cellStatuses.setIn([id, 'inputHidden'],
          !cellStatuses.getIn([id, 'inputHidden'])));
  },
  [constants.UPDATE_CELL_OUTPUTS]: function updateOutputs(state, action) {
    const { id, outputs } = action;
    return state.update('notebook', (notebook) => commutable.updateOutputs(notebook, id, outputs));
  },
  [constants.UPDATE_CELL_PAGERS]: function updateCellPagers(state, action) {
    const { id, pagers } = action;
    return state.setIn(['cellPagers', id], pagers);
  },
  [constants.UPDATE_CELL_STATUS]: function updateCellStatus(state, action) {
    const { id, status } = action;
    return state.setIn(['cellStatuses', id, 'status'], status);
  },
  [constants.SET_LANGUAGE_INFO]: function setLanguageInfo(state, action) {
    const langInfo = Immutable.fromJS(action.langInfo);
    return state.setIn(['notebook', 'metadata', 'language_info'], langInfo);
  },
  [constants.SET_KERNEL_INFO]: function setKernelSpec(state, action) {
    const { kernelInfo } = action;
    return state
      .setIn(['notebook', 'metadata', 'kernelspec'], Immutable.fromJS({
        name: kernelInfo.name,
        language: kernelInfo.spec.language,
        display_name: kernelInfo.spec.display_name,
      }))
      .setIn(['notebook', 'metadata', 'kernel_info', 'name'], kernelInfo.name);
  },
  [constants.OVERWRITE_METADATA_FIELD]: function overwriteMetadata(state, action) {
    const { field, value } = action;
    return state.setIn(['notebook', 'metadata', field], Immutable.fromJS(value));
  },
  [constants.ASSOCIATE_CELL_TO_MSG]: function associateCellToMsg(state, action) {
    const { cellId, msgId } = action;

    // Keep a forward and backward mapping of cell and msg ids so we can make
    // sure only one mapping per cell exists at any given time.
    const oldMsgId = state.getIn(['cellMsgAssociations', cellId]);
    const cellMsgAssociations = state.get('cellMsgAssociations').set(cellId, msgId);
    let msgCellAssociations = state.get('msgCellAssociations').set(msgId, cellId);
    if (oldMsgId) {
      msgCellAssociations = msgCellAssociations.delete(oldMsgId);
    }
    return state
      .set('cellMsgAssociations', cellMsgAssociations)
      .set('msgCellAssociations', msgCellAssociations);
  },
  [constants.COPY_CELL]: function copyCell(state, action) {
    const { id } = action;
    const cellMap = state.getIn(['notebook', 'cellMap']);
    const cell = cellMap.get(id);
    return state.set('copied', new Immutable.Map({ id, cell }));
  },
  [constants.PASTE_CELL]: function pasteCell(state) {
    const copiedCell = state.getIn(['copied', 'cell']);
    const copiedId = state.getIn(['copied', 'id']);
    const id = uuid.v4();

    return state.update('notebook', (notebook) =>
        commutable.insertCellAfter(notebook, copiedCell, id, copiedId))
          .setIn(['cellStatuses', id, 'outputHidden'], false)
          .setIn(['cellStatuses', id, 'inputHidden'], false);
  },
  [constants.CHANGE_CELL_TYPE]: function changeCellType(state, action) {
    const { id, to } = action;
    const from = state.getIn(['notebook', 'cellMap', id, 'cell_type']);

    if (from === to) {
      return state;
    } else if (from === 'markdown') {
      return state.setIn(['notebook', 'cellMap', id, 'cell_type'], to)
        .setIn(['notebook', 'cellMap', id, 'execution_count'], null)
        .setIn(['notebook', 'cellMap', id, 'outputs'], new Immutable.List());
    }

    return state.setIn(['notebook', 'cellMap', id, 'cell_type'], to)
      .delete(['notebook', 'cellMap', id, 'execution_count'])
      .delete(['notebook', 'cellMap', id, 'outputs']);
  },
}, widgets), {});
