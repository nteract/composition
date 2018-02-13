/* @flow */

import * as Immutable from "immutable";
import * as uuid from "uuid";

import { escapeCarriageReturnSafe } from "escape-carriage";

import * as actionTypes from "../actionTypes";

// TODO: With the new document plan, I think it starts to make sense to decouple
//       the document view actions and the underlying document format
import type {
  UnhideAll,
  RestartKernel,
  ClearAllOutputs,
  PasteCellAction,
  ChangeFilenameAction,
  ToggleCellExpansionAction,
  ChangeCellTypeAction,
  CutCellAction,
  CopyCellAction,
  DeleteMetadataFieldAction,
  OverwriteMetadataFieldAction,
  AcceptPayloadMessageAction,
  SetNotebookAction,
  NewCellAfterAction,
  NewCellBeforeAction,
  ClearOutputsAction,
  AppendOutputAction,
  DoneSavingAction,
  UpdateDisplayAction,
  FocusNextCellAction,
  FocusCellEditorAction,
  FocusNextCellEditorAction,
  FocusPreviousCellEditorAction,
  RemoveCellAction,
  FocusCellAction,
  NewCellAppendAction,
  MergeCellAfterAction,
  MoveCellAction,
  ToggleStickyCellAction,
  FocusPreviousCellAction,
  SetKernelInfoAction,
  SetLanguageInfoAction,
  UpdateCellStatusAction,
  ToggleCellInputVisibilityAction,
  ToggleCellOutputVisibilityAction,
  SetInCellAction,
  SendExecuteMessageAction
} from "../actionTypes";

import type {
  LanguageInfoMetadata,
  KernelInfo,
  DocumentRecord
} from "@nteract/types/core/records";

import { makeDocumentRecord } from "@nteract/types/core/records";

import {
  emptyCodeCell,
  emptyMarkdownCell,
  insertCellAt,
  insertCellAfter,
  removeCell,
  createImmutableOutput,
  createImmutableMimeBundle
} from "@nteract/commutable";

import type {
  ImmutableCell,
  ImmutableNotebook,
  CellID,
  CellType,
  ImmutableCellOrder,
  ImmutableOutput,
  ImmutableOutputs,
  MimeBundle
} from "@nteract/types/commutable";

import type { Output, StreamOutput } from "@nteract/commutable/src/v4";

// TODO: Import these from @nteract/types
// NOTE: number is only allowed when indexing into a List
type KeyPath = Immutable.List<string | number>;
type KeyPaths = Immutable.List<KeyPath>;

// TODO: Import these from @nteract/types
type ImmutableCellMap = Immutable.Map<string, ImmutableCell>;

/**
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Object} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {Immutable.List<Object>} updated-outputs - Outputs + Output
 */
export function reduceOutputs(
  outputs: ImmutableOutputs = Immutable.List(),
  output: Output
) {
  // eslint-disable-line max-len
  if (
    output.output_type !== "stream" ||
    (outputs.size > 0 && outputs.last().get("output_type") !== "stream")
  ) {
    // If it's not a stream type, we just fold in the output
    return outputs.push(createImmutableOutput(output));
  }

  const streamOutput: StreamOutput = output;

  function appendText(text: string): string {
    if (typeof streamOutput.text === "string") {
      return escapeCarriageReturnSafe(text + streamOutput.text);
    }
    return text;
  }

  if (
    outputs.size > 0 &&
    typeof streamOutput.name !== "undefined" &&
    outputs.last().get("output_type") === "stream"
  ) {
    // Invariant: size > 0, outputs.last() exists
    if (outputs.last().get("name") === streamOutput.name) {
      return outputs.updateIn([outputs.size - 1, "text"], appendText);
    }
    const nextToLast: ImmutableOutput = outputs.butLast().last();
    if (
      nextToLast &&
      nextToLast.get("output_type") === "stream" &&
      nextToLast.get("name") === streamOutput.name
    ) {
      return outputs.updateIn([outputs.size - 2, "text"], appendText);
    }
  }

  return outputs.push(createImmutableOutput(streamOutput));
}

export function cleanCellTransient(state: DocumentRecord, id: string) {
  // Clear out key paths that should no longer be referenced
  return state
    .updateIn(
      ["transient", "keyPathsForDisplays"],
      (kpfd: Immutable.Map<string, KeyPaths>) =>
        kpfd.map((keyPaths: KeyPaths) =>
          keyPaths.filter((keyPath: KeyPath) => keyPath.get(2) !== id)
        )
    )
    .setIn(["transient", "cellMap", id], new Immutable.Map());
}

function setNotebook(state: DocumentRecord, action: SetNotebookAction) {
  const { notebook, filename } = action;

  return state
    .set("notebook", notebook)
    .update("filename", oldFilename => (filename ? filename : oldFilename))
    .set("cellFocused", notebook.getIn(["cellOrder", 0]))
    .setIn(["transient", "cellMap"], new Immutable.Map());
}

function setNotebookCheckpoint(
  state: DocumentRecord,
  action: DoneSavingAction
) {
  // Use the current version of the notebook document
  return state.set("savedNotebook", state.get("notebook"));
}

function focusCell(state: DocumentRecord, action: FocusCellAction) {
  return state.set("cellFocused", action.id);
}

function clearOutputs(state: DocumentRecord, action: ClearOutputsAction) {
  const { id } = action;
  const type = state.getIn(["notebook", "cellMap", id, "cell_type"]);

  if (type === "code") {
    return cleanCellTransient(
      state
        .setIn(["notebook", "cellMap", id, "outputs"], new Immutable.List())
        .setIn(["notebook", "cellMap", id, "execution_count"], null),
      id
    );
  }
  return state;
}

function clearAllOutputs(
  state: DocumentRecord,
  action: ClearAllOutputs | RestartKernel
) {
  // If we get a restart kernel action that said to clear outputs, we'll
  // handle it
  if (
    action.type === actionTypes.RESTART_KERNEL &&
    !action.payload.clearOutputs
  ) {
    return state;
  }

  // For every cell, clear the outputs and execution counts
  const cellMap = state
    .getIn(["notebook", "cellMap"], new Immutable.Map())
    // NOTE: My kingdom for a mergeMap
    .map(cell => {
      if (cell.get("cell_type") === "code") {
        return cell.merge({
          outputs: new Immutable.List(),
          execution_count: null
        });
      }
      return cell;
    });

  // Clear all the transient data too
  const transient = Immutable.Map({
    keyPathsForDisplays: Immutable.Map(),
    cellMap: cellMap.map(() => new Immutable.Map())
  });

  return state
    .setIn(["notebook", "cellMap"], cellMap)
    .set("transient", transient);
}

function appendOutput(state: DocumentRecord, action: AppendOutputAction) {
  const output = action.output;
  const cellID = action.id;

  // If it's display data and it doesn't have a display id, fold it in like non
  // display data
  if (
    output.output_type !== "display_data" ||
    !(output && output.transient && output.transient.display_id)
  ) {
    return state.updateIn(
      ["notebook", "cellMap", cellID, "outputs"],
      (outputs: ImmutableOutputs): ImmutableOutputs =>
        reduceOutputs(outputs, output)
    );
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
  const outputIndex = state
    .getIn(["notebook", "cellMap", cellID, "outputs"], Immutable.List())
    .count();

  // Construct the path to the output for updating later
  const keyPath: KeyPath = Immutable.List([
    "notebook",
    "cellMap",
    cellID,
    "outputs",
    outputIndex
  ]);

  const keyPaths: KeyPaths = state
    // Extract the current list of keypaths for this displayID
    .getIn(
      ["transient", "keyPathsForDisplays", displayID],
      new Immutable.List()
    )
    // Append our current output's keyPath
    .push(keyPath);

  const immutableOutput = createImmutableOutput(output);

  // We'll reduce the overall state based on each keypath, updating output
  return keyPaths
    .reduce(
      (currState: DocumentRecord, kp: KeyPath) =>
        currState.setIn(kp, immutableOutput),
      state
    )
    .setIn(["transient", "keyPathsForDisplays", displayID], keyPaths);
}

function updateDisplay(state: DocumentRecord, action: UpdateDisplayAction) {
  const { content } = action;
  if (!(content && content.transient && content.transient.display_id)) {
    return state;
  }
  const displayID = content.transient.display_id;

  const keyPaths: KeyPaths = state.getIn(
    ["transient", "keyPathsForDisplays", displayID],
    new Immutable.List()
  );
  const updatedContent = {
    data: createImmutableMimeBundle(content.data || {}),
    metadata: Immutable.fromJS(content.metadata || {})
  };

  return keyPaths.reduce(
    (currState: DocumentRecord, kp: KeyPath) =>
      currState.updateIn(kp, output => {
        return output.merge(updatedContent);
      }),
    state
  );
}

function focusNextCell(state: DocumentRecord, action: FocusNextCellAction) {
  const cellOrder = state.getIn(["notebook", "cellOrder"], Immutable.List());

  const id = action.id ? action.id : state.get("cellFocused");
  // If for some reason we neither have an ID here or a focused cell, we just
  // keep the state consistent
  if (!id) {
    return state;
  }

  const curIndex = cellOrder.findIndex((foundId: CellID) => id === foundId);
  const curCellType = state.getIn(["notebook", "cellMap", id, "cell_type"]);

  const nextIndex = curIndex + 1;

  // When at the end, create a new cell
  if (nextIndex >= cellOrder.size) {
    if (!action.createCellIfUndefined) {
      return state;
    }

    const cellID: string = uuid.v4();
    const cell = curCellType === "code" ? emptyCodeCell : emptyMarkdownCell;

    const notebook: ImmutableNotebook = state.get("notebook");

    return state
      .set("cellFocused", cellID)
      .set("notebook", insertCellAt(notebook, cell, cellID, nextIndex));
  }

  // When in the middle of the notebook document, move to the next cell
  return state.set("cellFocused", cellOrder.get(nextIndex));
}

function focusPreviousCell(
  state: DocumentRecord,
  action: FocusPreviousCellAction
): DocumentRecord {
  const cellOrder = state.getIn(["notebook", "cellOrder"], Immutable.List());
  const curIndex = cellOrder.findIndex((id: CellID) => id === action.id);
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set("cellFocused", cellOrder.get(nextIndex));
}

function focusCellEditor(state: DocumentRecord, action: FocusCellEditorAction) {
  return state.set("editorFocused", action.id);
}

function focusNextCellEditor(
  state: DocumentRecord,
  action: FocusNextCellEditorAction
) {
  const cellOrder: ImmutableCellOrder = state.getIn(
    ["notebook", "cellOrder"],
    Immutable.List()
  );

  const id = action.id ? action.id : state.get("editorFocused");

  // If for some reason we neither have an ID here or a focused editor, we just
  // keep the state consistent
  if (!id) {
    return state;
  }

  const curIndex = cellOrder.findIndex((foundId: CellID) => id === foundId);
  const nextIndex = curIndex + 1;

  return state.set("editorFocused", cellOrder.get(nextIndex));
}

function focusPreviousCellEditor(
  state: DocumentRecord,
  action: FocusPreviousCellEditorAction
) {
  const cellOrder: ImmutableCellOrder = state.getIn(
    ["notebook", "cellOrder"],
    Immutable.List()
  );
  const curIndex = cellOrder.findIndex((id: CellID) => id === action.id);
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set("editorFocused", cellOrder.get(nextIndex));
}

function toggleStickyCell(
  state: DocumentRecord,
  action: ToggleStickyCellAction
) {
  const { id } = action;
  const stickyCells: Immutable.Set<CellID> = state.get("stickyCells");
  if (stickyCells.has(id)) {
    return state.set("stickyCells", stickyCells.delete(id));
  }
  return state.set("stickyCells", stickyCells.add(id));
}

function moveCell(state: DocumentRecord, action: MoveCellAction) {
  return state.updateIn(
    ["notebook", "cellOrder"],
    (cellOrder: ImmutableCellOrder) => {
      const oldIndex = cellOrder.findIndex(id => id === action.id);
      const newIndex =
        cellOrder.findIndex(id => id === action.destinationId) +
        (action.above ? 0 : 1);
      if (oldIndex === newIndex) {
        return cellOrder;
      }
      return cellOrder
        .splice(oldIndex, 1)
        .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.id);
    }
  );
}

function removeCellFromState(state: DocumentRecord, action: RemoveCellAction) {
  const { id } = action;
  return cleanCellTransient(
    state.update("notebook", (notebook: ImmutableNotebook) =>
      removeCell(notebook, id)
    ),
    id
  );
}

function newCellAfter(state: DocumentRecord, action: NewCellAfterAction) {
  const { cellType, id, source } = action;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid.v4();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const index = notebook.get("cellOrder").indexOf(id) + 1;
    return insertCellAt(notebook, cell.set("source", source), cellID, index);
  });
}

function newCellBefore(state: DocumentRecord, action: NewCellBeforeAction) {
  const { cellType, id } = action;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid.v4();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const cellOrder: ImmutableCellOrder = notebook.get("cellOrder");
    const index = cellOrder.indexOf(id);
    return insertCellAt(notebook, cell, cellID, index);
  });
}

function mergeCellAfter(state: DocumentRecord, action: MergeCellAfterAction) {
  const { id } = action;
  const cellOrder: ImmutableCellOrder = state.getIn(
    ["notebook", "cellOrder"],
    Immutable.List()
  );
  const index = cellOrder.indexOf(id);
  // do nothing if this is the last cell
  if (cellOrder.size === index + 1) {
    return state;
  }
  const cellMap: ImmutableCellMap = state.getIn(
    ["notebook", "cellMap"],
    Immutable.Map()
  );

  const nextId = cellOrder.get(index + 1);
  const firstSource: string = cellMap.getIn([id, "source"], "");
  const secondSource: string = cellMap.getIn([nextId, "source"], "");

  const source = firstSource.concat("\n", "\n", secondSource);

  return state.update("notebook", (notebook: ImmutableNotebook) =>
    removeCell(notebook.setIn(["cellMap", id, "source"], source), nextId)
  );
}

function newCellAppend(state: DocumentRecord, action: NewCellAppendAction) {
  const { cellType } = action;
  const notebook: ImmutableNotebook = state.get("notebook");
  const cellOrder: ImmutableCellOrder = notebook.get("cellOrder");
  const cell: ImmutableCell =
    cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const index = cellOrder.count();
  const cellID = uuid.v4();
  return state.set("notebook", insertCellAt(notebook, cell, cellID, index));
}

function acceptPayloadMessage(
  state: DocumentRecord,
  action: AcceptPayloadMessageAction
): DocumentRecord {
  const { id, payload } = action;

  if (payload.source === "page") {
    // Append as output instead of a pager area
    // FIXME: Bulk this in as an output as part of the epic, converting it to
    //        display_data there
    return appendOutput(state, {
      type: actionTypes.APPEND_OUTPUT,
      id,
      output: {
        output_type: "display_data",
        data: payload.data,
        metadata: {}
      }
    });
  } else if (payload.source === "set_next_input") {
    if (payload.replace) {
      // this payload is sent in IPython when you use %load
      // and is intended to replace cell source
      return state.setIn(["notebook", "cellMap", id, "source"], payload.text);
    } else {
      // create the next cell
      return newCellAfter(state, {
        type: actionTypes.NEW_CELL_AFTER,
        cellType: "code",
        source: payload.text,
        id
      });
    }
  }
  // If the payload is unsupported, just return the current state
  return state;
}

function sendExecuteRequest(
  state: DocumentRecord,
  action: SendExecuteMessageAction
) {
  const { id } = action;
  // TODO: Record the last execute request for this cell

  // * Clear outputs
  // * Set status to queued, as all we've done is submit the execution request
  // TODO: Use a setWithMutations or otherwise to do this in an efficient way
  return clearOutputs(state, {
    type: "CLEAR_OUTPUTS",
    id
  }).setIn(["transient", "cellMap", id, "status"], "queued");
}

function setInCell(state: DocumentRecord, action: SetInCellAction<*>) {
  return state.setIn(
    ["notebook", "cellMap", action.id].concat(action.path),
    action.value
  );
}

function toggleCellOutputVisibility(
  state: DocumentRecord,
  action: ToggleCellOutputVisibilityAction
) {
  const { id } = action;
  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "outputHidden"],
    !state.getIn(["notebook", "cellMap", id, "metadata", "outputHidden"])
  );
}

function unhideAll(state: DocumentRecord, action: UnhideAll) {
  return state.updateIn(["notebook", "cellMap"], cellMap =>
    cellMap.map(cell => {
      if (cell.get("cell_type") === "code") {
        return cell.mergeIn(["metadata"], {
          // TODO: Verify that we convert to one namespace for hidden input/output
          outputHidden: action.payload.outputHidden,
          inputHidden: action.payload.inputHidden
        });
      }
      return cell;
    })
  );
}

function toggleCellInputVisibility(
  state: DocumentRecord,
  action: ToggleCellInputVisibilityAction
) {
  const { id } = action;
  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "inputHidden"],
    !state.getIn(["notebook", "cellMap", id, "metadata", "inputHidden"])
  );
}

function updateCellStatus(
  state: DocumentRecord,
  action: UpdateCellStatusAction
) {
  const { id, status } = action;
  return state.setIn(["transient", "cellMap", id, "status"], status);
}
function setLanguageInfo(state: DocumentRecord, action: SetLanguageInfoAction) {
  const langInfo = Immutable.fromJS(action.langInfo);
  return state.setIn(["notebook", "metadata", "language_info"], langInfo);
}

function setKernelSpec(state: DocumentRecord, action: SetKernelInfoAction) {
  const { kernelInfo } = action;
  return state
    .setIn(
      ["notebook", "metadata", "kernelspec"],
      Immutable.fromJS({
        name: kernelInfo.name,
        language: kernelInfo.spec.language,
        display_name: kernelInfo.spec.display_name
      })
    )
    .setIn(["notebook", "metadata", "kernel_info", "name"], kernelInfo.name);
}

function overwriteMetadata(
  state: DocumentRecord,
  action: OverwriteMetadataFieldAction
) {
  const { field, value } = action;
  return state.setIn(["notebook", "metadata", field], Immutable.fromJS(value));
}
function deleteMetadata(
  state: DocumentRecord,
  action: DeleteMetadataFieldAction
) {
  const { field } = action;
  return state.deleteIn(["notebook", "metadata", field]);
}

function copyCell(state: DocumentRecord, action: CopyCellAction) {
  const { id } = action;
  const cellMap = state.getIn(["notebook", "cellMap"], Immutable.Map());
  const cell = cellMap.get(id);
  // $FlowFixMe: Immutable
  return state.set("copied", new Immutable.Map({ id, cell }));
}

function cutCell(state: DocumentRecord, action: CutCellAction) {
  const { id } = action;
  const cellMap = state.getIn(["notebook", "cellMap"], Immutable.Map());
  const cell: ImmutableCell = cellMap.get(id);
  return (
    state
      // $FlowFixMe: Immutable
      .set("copied", new Immutable.Map({ id, cell }))
      .update("notebook", (notebook: ImmutableNotebook) =>
        removeCell(notebook, id)
      )
  );
}

function pasteCell(state: DocumentRecord) {
  const copiedCell: ImmutableCell | null = state.getIn(
    ["copied", "cell"],
    null
  );
  const copiedId: string | null = state.getIn(["copied", "id"], null);

  if (copiedCell === null || copiedId === null) {
    return state;
  }

  const id = uuid.v4();

  return state.update("notebook", (notebook: ImmutableNotebook) =>
    insertCellAfter(notebook, copiedCell, id, copiedId)
  );
}
function changeCellType(state: DocumentRecord, action: ChangeCellTypeAction) {
  const { id, to } = action;
  const from = state.getIn(["notebook", "cellMap", id, "cell_type"]);

  if (from === to) {
    return state;
  } else if (from === "markdown") {
    return state
      .setIn(["notebook", "cellMap", id, "cell_type"], to)
      .setIn(["notebook", "cellMap", id, "execution_count"], null)
      .setIn(["notebook", "cellMap", id, "outputs"], new Immutable.List());
  }

  return cleanCellTransient(
    state
      .setIn(["notebook", "cellMap", id, "cell_type"], to)
      .deleteIn(["notebook", "cellMap", id, "execution_count"])
      .deleteIn(["notebook", "cellMap", id, "outputs"]),
    id
  );
}

function toggleOutputExpansion(
  state: DocumentRecord,
  action: ToggleCellExpansionAction
) {
  const { id } = action;
  return state.updateIn(["notebook", "cellMap"], (cells: ImmutableCellMap) =>
    cells.setIn(
      [id, "metadata", "outputExpanded"],
      !cells.getIn([id, "metadata", "outputExpanded"])
    )
  );
}

function changeFilename(state: DocumentRecord, action: ChangeFilenameAction) {
  if (action.filename) {
    return state.set("filename", action.filename);
  }
  return state;
}

type FocusCellActionType =
  | FocusPreviousCellEditorAction
  | FocusPreviousCellAction
  | FocusNextCellEditorAction
  | FocusNextCellAction
  | FocusCellEditorAction
  | FocusCellAction;

type DocumentAction =
  | ToggleStickyCellAction
  | FocusCellActionType
  | SetNotebookAction
  | ClearOutputsAction
  | AppendOutputAction
  | UpdateDisplayAction
  | MoveCellAction
  | RemoveCellAction
  | NewCellAfterAction
  | NewCellBeforeAction
  | NewCellAppendAction
  | MergeCellAfterAction
  | ToggleCellOutputVisibilityAction
  | ToggleCellInputVisibilityAction
  | UpdateCellStatusAction
  | SetLanguageInfoAction
  | SetKernelInfoAction
  | OverwriteMetadataFieldAction
  | DeleteMetadataFieldAction
  | CopyCellAction
  | CutCellAction
  | PasteCellAction
  | ChangeCellTypeAction
  | ToggleCellExpansionAction
  | AcceptPayloadMessageAction
  | SendExecuteMessageAction
  | DoneSavingAction
  | RestartKernel
  | ClearAllOutputs
  | SetInCellAction<*>;

const defaultDocument: DocumentRecord = makeDocumentRecord();

function handleDocument(
  state: DocumentRecord = defaultDocument,
  action: DocumentAction
) {
  switch (action.type) {
    case actionTypes.SEND_EXECUTE_REQUEST:
      return sendExecuteRequest(state, action);
    case actionTypes.SET_NOTEBOOK:
      return setNotebook(state, action);
    case actionTypes.DONE_SAVING:
      return setNotebookCheckpoint(state, action);
    case actionTypes.FOCUS_CELL:
      return focusCell(state, action);
    case actionTypes.CLEAR_OUTPUTS:
      return clearOutputs(state, action);
    case actionTypes.CLEAR_ALL_OUTPUTS:
    case actionTypes.RESTART_KERNEL:
      return clearAllOutputs(state, action);
    case actionTypes.APPEND_OUTPUT:
      return appendOutput(state, action);
    case actionTypes.UPDATE_DISPLAY:
      return updateDisplay(state, action);
    case actionTypes.FOCUS_NEXT_CELL:
      return focusNextCell(state, action);
    case actionTypes.FOCUS_PREVIOUS_CELL:
      return focusPreviousCell(state, action);
    case actionTypes.FOCUS_CELL_EDITOR:
      return focusCellEditor(state, action);
    case actionTypes.FOCUS_NEXT_CELL_EDITOR:
      return focusNextCellEditor(state, action);
    case actionTypes.FOCUS_PREVIOUS_CELL_EDITOR:
      return focusPreviousCellEditor(state, action);
    case actionTypes.TOGGLE_STICKY_CELL:
      return toggleStickyCell(state, action);
    case actionTypes.SET_IN_CELL:
      return setInCell(state, action);
    case actionTypes.MOVE_CELL:
      return moveCell(state, action);
    case actionTypes.REMOVE_CELL:
      return removeCellFromState(state, action);
    case actionTypes.NEW_CELL_AFTER:
      return newCellAfter(state, action);
    case actionTypes.NEW_CELL_BEFORE:
      return newCellBefore(state, action);
    case actionTypes.MERGE_CELL_AFTER:
      return mergeCellAfter(state, action);
    case actionTypes.NEW_CELL_APPEND:
      return newCellAppend(state, action);
    case actionTypes.TOGGLE_CELL_OUTPUT_VISIBILITY:
      return toggleCellOutputVisibility(state, action);
    case actionTypes.TOGGLE_CELL_INPUT_VISIBILITY:
      return toggleCellInputVisibility(state, action);
    case actionTypes.ACCEPT_PAYLOAD_MESSAGE_ACTION:
      return acceptPayloadMessage(state, action);
    case actionTypes.UPDATE_CELL_STATUS:
      return updateCellStatus(state, action);
    case actionTypes.SET_LANGUAGE_INFO:
      return setLanguageInfo(state, action);
    case actionTypes.SET_KERNEL_INFO:
      return setKernelSpec(state, action);
    case actionTypes.OVERWRITE_METADATA_FIELD:
      return overwriteMetadata(state, action);
    case actionTypes.DELETE_METADATA_FIELD:
      return deleteMetadata(state, action);
    case actionTypes.COPY_CELL:
      return copyCell(state, action);
    case actionTypes.CUT_CELL:
      return cutCell(state, action);
    case actionTypes.PASTE_CELL:
      return pasteCell(state);
    case actionTypes.CHANGE_CELL_TYPE:
      return changeCellType(state, action);
    case actionTypes.TOGGLE_OUTPUT_EXPANSION:
      return toggleOutputExpansion(state, action);
    case actionTypes.UNHIDE_ALL:
      return unhideAll(state, action);
    case actionTypes.CHANGE_FILENAME:
      return changeFilename(state, action);
    default:
      (action: empty);
      return state;
  }
}

export default handleDocument;
