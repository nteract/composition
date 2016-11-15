import Immutable from 'immutable';
import { handleActions } from 'redux-actions';
import * as uuid from 'uuid';
import * as commutable from 'commutable';

import * as constants from '../constants';

const _ = require('lodash');

/**
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Object} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Immutable.List<Object>} updated-outputs - Outputs + Output
 */
export function reduceOutputs(outputs, output) {
  // Naive implementation of kernel stream buffering
  // This should be broken out into a nice testable function
  if (outputs.size > 0 &&
      output.output_type === 'stream' &&
      typeof output.name !== 'undefined' &&
      outputs.last().get('output_type') === 'stream'
    ) {
    // Invariant: size > 0, outputs.last() exists
    if (outputs.last().get('name') === output.name) {
      return outputs.updateIn([outputs.size - 1, 'text'], text => text + output.text);
    }
    const nextToLast = outputs.butLast().last();
    if (nextToLast &&
        nextToLast.get('output_type') === 'stream' &&
        nextToLast.get('name') === output.name) {
      return outputs.updateIn([outputs.size - 2, 'text'], text => text + output.text);
    }
  }

  return outputs.push(Immutable.fromJS(output));
}

export function cleanCellTransient(state, id) {
  // Clear out key paths that should no longer be referenced
  return state.updateIn(['transient', 'keyPathsForDisplays'], (kpfd) =>
    kpfd.map(keyPaths =>
      keyPaths.filter(keyPath => keyPath.get(2) !== id)
    )
  );
}

export default handleActions({
  [constants.SET_NOTEBOOK]: function setNotebook(state, action) {
    const notebook = action.notebook
      .update('cellMap', (cells) =>
        cells.map((value) =>
          value.setIn(['metadata', 'inputHidden'], false)
                .setIn(['metadata', 'outputHidden'], false)
                .setIn(['metadata', 'outputExpanded'], false)
                .set('status', '')));

    return state.set('notebook', notebook)
      .set('cellFocused', notebook.getIn(['cellOrder', 0]));
  },
  [constants.FOCUS_CELL]: function focusCell(state, action) {
    return state.set('cellFocused', action.id);
  },
  [constants.CLEAR_OUTPUTS]: function clearOutputs(state, action) {
    const { id } = action;

    return cleanCellTransient(
      state.setIn(['notebook', 'cellMap', id, 'outputs'], new Immutable.List()),
      id
    );
  },
  [constants.APPEND_OUTPUT]: function appendOutput(state, action) {
    const output = action.output;
    const cellID = action.id;

    if (output.output_type !== 'display_data' || !(_.has(output, 'transient.display_id'))) {
      return state.updateIn(['notebook', 'cellMap', cellID, 'outputs'],
        (outputs) => reduceOutputs(outputs, output));
    }

    // We now have a display_data that includes a transient display_id
    // output: {
    //   data: { 'text/html': '<b>woo</b>' }
    //   metadata: {}
    //   transient: { display_id: '12312' }
    // }

    // We now have a display to track
    const displayID = output.transient.display_id;

    // Every time we see a display id we're going to capture the keypath
    // to the output

    // Determine the next output index
    const outputIndex = state.getIn(['notebook', 'cellMap', cellID, 'outputs']).count();

    // Construct the path to the output for updating later
    const keyPath = Immutable.List(['notebook', 'cellMap', cellID, 'outputs', outputIndex]);

    const keyPaths = state
      // Extract the current list of keypaths for this displayID
      .getIn(
        ['transient', 'keyPathsForDisplays', displayID], new Immutable.List()
      )
      // Append our current output's keyPath
      .push(keyPath);

    const immutableOutput = Immutable.fromJS(output);

    // We'll reduce the overall state based on each keypath, updating output
    return keyPaths.reduce((currState, kp) => currState.setIn(kp, immutableOutput), state)
      .setIn(['transient', 'keyPathsForDisplays', displayID], keyPaths);
  },
  [constants.UPDATE_DISPLAY]: function updateDisplay(state, action) {
    const output = Immutable.fromJS(action.output);
    const displayID = output.getIn(['transient', 'display_id']);
    const keyPaths = state
      .getIn(
        ['transient', 'keyPathsForDisplays', displayID], new Immutable.List());
    return keyPaths.reduce((currState, kp) => currState.setIn(kp, output), state);
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
      return state.set('cellFocused', cellID)
        .update('notebook',
          (notebook) => commutable.insertCellAt(notebook, cell, cellID, nextIndex))
        .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
        .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
    }

    // When in the middle of the notebook document, move to the next cell
    return state.set('cellFocused', cellOrder.get(nextIndex));
  },
  [constants.FOCUS_PREVIOUS_CELL]: function focusPreviousCell(state, action) {
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const curIndex = cellOrder.findIndex(id => id === action.id);
    const nextIndex = Math.max(0, curIndex - 1);

    return state.set('cellFocused', cellOrder.get(nextIndex));
  },
  [constants.FOCUS_CELL_EDITOR]: function focusCellEditor(state, action) {
    return state.set('editorFocused', action.id);
  },
  [constants.FOCUS_NEXT_CELL_EDITOR]: function focusNextCellEditor(state, action) {
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const curIndex = cellOrder.findIndex(id => id === action.id);
    const nextIndex = curIndex + 1;

    return state.set('editorFocused', cellOrder.get(nextIndex));
  },
  [constants.FOCUS_PREVIOUS_CELL_EDITOR]: function focusPreviousCellEditor(state, action) {
    const cellOrder = state.getIn(['notebook', 'cellOrder']);
    const curIndex = cellOrder.findIndex(id => id === action.id);
    const nextIndex = Math.max(0, curIndex - 1);

    return state.set('editorFocused', cellOrder.get(nextIndex));
  },
  [constants.TOGGLE_STICKY_CELL]: function toggleStickyCell(state, action) {
    const { id } = action;
    const stickyCells = state.get('stickyCells');
    if (stickyCells.has(id)) {
      return state.set('stickyCells', stickyCells.delete(id));
    }
    return state.set('stickyCells', stickyCells.add(id));
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
    return cleanCellTransient(
      state.update('notebook',
        (notebook) => commutable.removeCell(notebook, id)
      ),
      id
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
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
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
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
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
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', cellID, 'metadata', 'inputHidden'], false);
  },
  [constants.UPDATE_CELL_SOURCE]: function updateSource(state, action) {
    const { id, source } = action;
    return state.update('notebook', (notebook) => commutable.updateSource(notebook, id, source));
  },
  [constants.SPLIT_CELL]: function splitCell(state, action) {
    const { id, position } = action;
    const index = state.getIn(['notebook', 'cellOrder']).indexOf(id);
    const updatedState = state.update('notebook',
        (notebook) => commutable.splitCell(notebook, id, position));
    const newCell = updatedState.getIn(['notebook', 'cellOrder', index + 1]);
    return updatedState
      .setIn(['notebook', 'cellMap', newCell, 'metadata', 'outputHidden'], false)
      .setIn(['notebook', 'cellMap', newCell, 'metadata', 'inputHidden'], false);
  },
  [constants.CHANGE_OUTPUT_VISIBILITY]: function changeOutputVisibility(state, action) {
    const { id } = action;
    return state.setIn(['notebook', 'cellMap', id, 'metadata', 'outputHidden'],
      !state.getIn(['notebook', 'cellMap', id, 'metadata', 'outputHidden']));
  },
  [constants.CHANGE_INPUT_VISIBILITY]: function changeInputVisibility(state, action) {
    const { id } = action;
    return state.setIn(['notebook', 'cellMap', id, 'metadata', 'inputHidden'],
      !state.getIn(['notebook', 'cellMap', id, 'metadata', 'inputHidden']));
  },
  [constants.UPDATE_CELL_PAGERS]: function updateCellPagers(state, action) {
    const { id, pagers } = action;
    return state.setIn(['cellPagers', id], pagers);
  },
  [constants.UPDATE_CELL_STATUS]: function updateCellStatus(state, action) {
    const { id, status } = action;
    return state.setIn(['notebook', 'cellMap', id, 'status'], status);
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
  [constants.COPY_CELL]: function copyCell(state, action) {
    const { id } = action;
    const cellMap = state.getIn(['notebook', 'cellMap']);
    const cell = cellMap.get(id);
    return state.set('copied', new Immutable.Map({ id, cell }));
  },
  [constants.CUT_CELL]: function cutCell(state, action) {
    const { id } = action;
    const cellMap = state.getIn(['notebook', 'cellMap']);
    const cell = cellMap.get(id);
    return state
      .set('copied', new Immutable.Map({ id, cell }))
      .update('notebook', (notebook) => commutable.removeCell(notebook, id));
  },
  [constants.PASTE_CELL]: function pasteCell(state) {
    const copiedCell = state.getIn(['copied', 'cell']);
    const copiedId = state.getIn(['copied', 'id']);
    const id = uuid.v4();

    return state.update('notebook', (notebook) =>
        commutable.insertCellAfter(notebook, copiedCell, id, copiedId))
          .setIn(['notebook', 'cellMap', id, 'metadata', 'outputHidden'], false)
          .setIn(['notebook', 'cellMap', id, 'metadata', 'inputHidden'], false);
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

    return cleanCellTransient(state.setIn(['notebook', 'cellMap', id, 'cell_type'], to)
      .delete(['notebook', 'cellMap', id, 'execution_count'])
      .delete(['notebook', 'cellMap', id, 'outputs']),
      id);
  },
  [constants.TOGGLE_OUTPUT_EXPANSION]: function toggleOutputExpansion(state, action) {
    const { id } = action;
    return state.updateIn(['notebook', 'cellMap'], (cells) =>
      cells.setIn([id, 'metadata', 'outputExpanded'],
        !cells.getIn([id, 'metadata', 'outputExpanded'])));
  },
}, {});
