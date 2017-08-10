/* @flow */

import * as Immutable from "immutable";
import * as uuid from "uuid";

import { escapeCarriageReturnSafe } from "escape-carriage";

import * as constants from "../constants";

import type { LanguageInfoMetadata, KernelInfo } from "../records";

import { DocumentRecord } from "../records";

import {
  emptyCodeCell,
  emptyMarkdownCell,
  insertCellAt,
  insertCellAfter,
  removeCell,
  createImmutableOutput
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
} from "@nteract/commutable/src/types";

import type { Output, StreamOutput } from "@nteract/commutable/src/v4";

type Pager = {
  source: "page",
  data: MimeBundle,
  start: number
};

// Note: number is only allowed when indexing into a List
type KeyPath = Immutable.List<string | number>;
type KeyPaths = Immutable.List<KeyPath>;

// It's really an Immutable.Record<Document>, we'll do this for now until a fix
// https://github.com/facebook/immutable-js/issues/998
type DocumentState = Immutable.Map<string, any>; // & Document;

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

export function cleanCellTransient(state: DocumentState, id: string) {
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

// It would probably be wise to make this JSON serializable and not be using
// the immutable.js version of the notebook in the action
type SetNotebookAction = { type: "SET_NOTEBOOK", notebook: ImmutableNotebook };
function setNotebook(state: DocumentState, action: SetNotebookAction) {
  const { notebook } = action;

  return state
    .set("notebook", notebook)
    .set("cellFocused", notebook.getIn(["cellOrder", 0]))
    .setIn(["transient", "cellMap"], new Immutable.Map());
}

type FocusCellAction = { type: "FOCUS_CELL", id: CellID };
function focusCell(state: DocumentState, action: FocusCellAction) {
  return state.set("cellFocused", action.id);
}

type ClearOutputsAction = { type: "CLEAR_OUTPUTS", id: CellID };
function clearOutputs(state: DocumentState, action: ClearOutputsAction) {
  const { id } = action;
  const type = state.getIn(["notebook", "cellMap", id, "cell_type"]);

  if (type === "code") {
    return cleanCellTransient(
      state.setIn(["notebook", "cellMap", id, "outputs"], new Immutable.List()),
      id
    );
  }
  return state;
}

type AppendOutputAction = { type: "APPEND_OUTPUT", id: CellID, output: Output };
function appendOutput(state: DocumentState, action: AppendOutputAction) {
  const output = action.output;
  const cellID = action.id;

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
      (currState: DocumentState, kp: KeyPath) =>
        currState.setIn(kp, immutableOutput),
      state
    )
    .setIn(["transient", "keyPathsForDisplays", displayID], keyPaths);
}

type UpdateDisplayAction = { type: "UPDATE_DISPLAY", output: Output };
function updateDisplay(state: DocumentState, action: UpdateDisplayAction) {
  const { output } = action;
  if (!(output && output.transient && output.transient.display_id)) {
    return state;
  }
  const displayID = output.transient.display_id;
  const immOutput: ImmutableOutput = createImmutableOutput(output);

  const keyPaths: KeyPaths = state.getIn(
    ["transient", "keyPathsForDisplays", displayID],
    new Immutable.List()
  );
  return keyPaths.reduce(
    (currState: DocumentState, kp: KeyPath) => currState.setIn(kp, immOutput),
    state
  );
}

type FocusNextCellAction = {
  type: "FOCUS_NEXT_CELL",
  id: CellID,
  createCellIfUndefined: boolean
};
function focusNextCell(state: DocumentState, action: FocusNextCellAction) {
  const cellOrder = state.getIn(["notebook", "cellOrder"], Immutable.List());
  const curIndex = cellOrder.findIndex((id: CellID) => id === action.id);
  const curCellType = state.getIn([
    "notebook",
    "cellMap",
    action.id,
    "cell_type"
  ]);

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

type FocusPreviousCellAction = { type: "FOCUS_PREVIOUS_CELL", id: CellID };
function focusPreviousCell(
  state: DocumentState,
  action: FocusPreviousCellAction
): DocumentState {
  const cellOrder = state.getIn(["notebook", "cellOrder"], Immutable.List());
  const curIndex = cellOrder.findIndex((id: CellID) => id === action.id);
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set("cellFocused", cellOrder.get(nextIndex));
}

type FocusCellEditorAction = { type: "FOCUS_CELL_EDITOR", id: CellID };
function focusCellEditor(state: DocumentState, action: FocusCellEditorAction) {
  return state.set("editorFocused", action.id);
}

type FocusNextCellEditorAction = { type: "FOCUS_NEXT_CELL_EDITOR", id: CellID };
function focusNextCellEditor(
  state: DocumentState,
  action: FocusNextCellEditorAction
) {
  const cellOrder: ImmutableCellOrder = state.getIn(
    ["notebook", "cellOrder"],
    Immutable.List()
  );
  const curIndex = cellOrder.findIndex((id: CellID) => id === action.id);
  const nextIndex = curIndex + 1;

  return state.set("editorFocused", cellOrder.get(nextIndex));
}

type FocusPreviousCellEditorAction = {
  type: "FOCUS_PREVIOUS_CELL_EDITOR",
  id: CellID
};
function focusPreviousCellEditor(
  state: DocumentState,
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

type ToggleStickyCellAction = { type: "TOGGLE_STICKY_CELL", id: CellID };
function toggleStickyCell(
  state: DocumentState,
  action: ToggleStickyCellAction
) {
  const { id } = action;
  const stickyCells: Immutable.Set<CellID> = state.get("stickyCells");
  if (stickyCells.has(id)) {
    return state.set("stickyCells", stickyCells.delete(id));
  }
  return state.set("stickyCells", stickyCells.add(id));
}

type UpdateExecutionCountAction = {
  type: "UPDATE_CELL_EXECUTION_COUNT",
  id: CellID,
  count: number
};
function updateExecutionCount(
  state: DocumentState,
  action: UpdateExecutionCountAction
) {
  return state.setIn(
    ["notebook", "cellMap", action.id, "execution_count"],
    action.count
  );
}

type MoveCellAction = { type: "MOVE_CELL", id: CellID, destinationId: CellID };
function moveCell(state: DocumentState, action: MoveCellAction) {
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

type RemoveCellAction = { type: "REMOVE_CELL", id: CellID };
function removeCellFromState(state: DocumentState, action: RemoveCellAction) {
  const { id } = action;
  return cleanCellTransient(
    state.update("notebook", (notebook: ImmutableNotebook) =>
      removeCell(notebook, id)
    ),
    id
  );
}

type NewCellAfterAction = {
  type: "NEW_CELL_AFTER",
  id: CellID,
  cellType: CellType,
  source: string
};
function newCellAfter(state: DocumentState, action: NewCellAfterAction) {
  const { cellType, id, source } = action;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid.v4();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const index = notebook.get("cellOrder").indexOf(id) + 1;
    return insertCellAt(notebook, cell.set("source", source), cellID, index);
  });
}

type NewCellBeforeAction = {
  type: "NEW_CELL_BEFORE",
  cellType: CellType,
  id: CellID
};
function newCellBefore(state: DocumentState, action: NewCellBeforeAction) {
  const { cellType, id } = action;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid.v4();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const cellOrder: ImmutableCellOrder = notebook.get("cellOrder");
    const index = cellOrder.indexOf(id);
    return insertCellAt(notebook, cell, cellID, index);
  });
}

type MergeCellAfterAction = { type: "MERGE_CELL_AFTER", id: CellID };
function mergeCellAfter(state: DocumentState, action: MergeCellAfterAction) {
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

type NewCellAppendAction = { type: "NEW_CELL_APPEND", cellType: CellType };
function newCellAppend(state: DocumentState, action: NewCellAppendAction) {
  const { cellType } = action;
  const notebook: ImmutableNotebook = state.get("notebook");
  const cellOrder: ImmutableCellOrder = notebook.get("cellOrder");
  const cell: ImmutableCell =
    cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const index = cellOrder.count();
  const cellID = uuid.v4();
  return state.set("notebook", insertCellAt(notebook, cell, cellID, index));
}

type UpdateSourceAction = {
  type: "UPDATE_CELL_SOURCE",
  id: CellID,
  source: string
};
function updateSource(state: DocumentState, action: UpdateSourceAction) {
  const { id, source } = action;
  return state.setIn(["notebook", "cellMap", id, "source"], source);
}

type ChangeOutputVisibilityAction = {
  type: "CHANGE_OUTPUT_VISIBILITY",
  id: CellID
};
function changeOutputVisibility(
  state: DocumentState,
  action: ChangeOutputVisibilityAction
) {
  const { id } = action;
  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "outputHidden"],
    !state.getIn(["notebook", "cellMap", id, "metadata", "outputHidden"])
  );
}

type ChangeInputVisibilityAction = {
  type: "CHANGE_INPUT_VISIBILITY",
  id: CellID
};
function changeInputVisibility(
  state: DocumentState,
  action: ChangeInputVisibilityAction
) {
  const { id } = action;
  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "inputHidden"],
    !state.getIn(["notebook", "cellMap", id, "metadata", "inputHidden"])
  );
}

type UpdateCellPagersAction = {
  type: "UPDATE_CELL_PAGERS",
  id: CellID,
  pagers: Immutable.Map<string, Pager>
};
function updateCellPagers(
  state: DocumentState,
  action: UpdateCellPagersAction
) {
  const { id, pagers } = action;
  return state.setIn(["cellPagers", id], pagers);
}

type UpdateCellStatusAction = {
  type: "UPDATE_CELL_STATUS",
  id: CellID,
  status: string
};
function updateCellStatus(
  state: DocumentState,
  action: UpdateCellStatusAction
) {
  const { id, status } = action;
  return state.setIn(["transient", "cellMap", id, "status"], status);
}

type SetLanguageInfoAction = {
  type: "SET_LANGUAGE_INFO",
  langInfo: LanguageInfoMetadata
};
function setLanguageInfo(state: DocumentState, action: SetLanguageInfoAction) {
  const langInfo = Immutable.fromJS(action.langInfo);
  return state.setIn(["notebook", "metadata", "language_info"], langInfo);
}

type SetKernelInfoAction = { type: "SET_KERNEL_INFO", kernelInfo: KernelInfo };
function setKernelSpec(state: DocumentState, action: SetKernelInfoAction) {
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

type OverwriteMetadataFieldAction = {
  type: "OVERWRITE_METADATA_FIELD",
  field: string,
  value: any
};
function overwriteMetadata(
  state: DocumentState,
  action: OverwriteMetadataFieldAction
) {
  const { field, value } = action;
  return state.setIn(["notebook", "metadata", field], Immutable.fromJS(value));
}

type DeleteMetadataFieldAction = {
  type: "DELETE_METADATA_FIELD",
  field: string
};
function deleteMetadata(
  state: DocumentState,
  action: DeleteMetadataFieldAction
) {
  const { field } = action;
  return state.deleteIn(["notebook", "metadata", field]);
}

type CopyCellAction = { type: "COPY_CELL", id: CellID };
function copyCell(state: DocumentState, action: CopyCellAction) {
  const { id } = action;
  const cellMap = state.getIn(["notebook", "cellMap"], Immutable.Map());
  const cell = cellMap.get(id);
  return state.set("copied", new Immutable.Map({ id, cell }));
}

type CutCellAction = { type: "CUT_CELL", id: CellID };
function cutCell(state: DocumentState, action: CutCellAction) {
  const { id } = action;
  const cellMap = state.getIn(["notebook", "cellMap"], Immutable.Map());
  const cell: ImmutableCell = cellMap.get(id);
  return state
    .set("copied", new Immutable.Map({ id, cell }))
    .update("notebook", (notebook: ImmutableNotebook) =>
      removeCell(notebook, id)
    );
}

type PasteCellAction = { type: "PASTE_CELL" };
function pasteCell(state: DocumentState) {
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

type ChangeCellTypeAction = {
  type: "CHANGE_CELL_TYPE",
  id: CellID,
  to: string
};
function changeCellType(state: DocumentState, action: ChangeCellTypeAction) {
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

type ToggleCellExpansionAction = {
  type: "TOGGLE_OUTPUT_EXPANSION",
  id: CellID
};
function toggleOutputExpansion(
  state: DocumentState,
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
  | UpdateExecutionCountAction
  | MoveCellAction
  | RemoveCellAction
  | NewCellAfterAction
  | NewCellBeforeAction
  | NewCellAppendAction
  | MergeCellAfterAction
  | UpdateSourceAction
  | ChangeOutputVisibilityAction
  | ChangeInputVisibilityAction
  | UpdateCellPagersAction
  | UpdateCellStatusAction
  | SetLanguageInfoAction
  | SetKernelInfoAction
  | OverwriteMetadataFieldAction
  | DeleteMetadataFieldAction
  | CopyCellAction
  | CutCellAction
  | PasteCellAction
  | ChangeCellTypeAction
  | ToggleCellExpansionAction;

const defaultDocument: DocumentState = DocumentRecord();

function handleDocument(
  state: DocumentState = defaultDocument,
  action: DocumentAction
) {
  switch (action.type) {
    case constants.SET_NOTEBOOK:
      return setNotebook(state, action);
    case constants.FOCUS_CELL:
      return focusCell(state, action);
    case constants.CLEAR_OUTPUTS:
      return clearOutputs(state, action);
    case constants.APPEND_OUTPUT:
      return appendOutput(state, action);
    case constants.UPDATE_DISPLAY:
      return updateDisplay(state, action);
    case constants.FOCUS_NEXT_CELL:
      return focusNextCell(state, action);
    case constants.FOCUS_PREVIOUS_CELL:
      return focusPreviousCell(state, action);
    case constants.FOCUS_CELL_EDITOR:
      return focusCellEditor(state, action);
    case constants.FOCUS_NEXT_CELL_EDITOR:
      return focusNextCellEditor(state, action);
    case constants.FOCUS_PREVIOUS_CELL_EDITOR:
      return focusPreviousCellEditor(state, action);
    case constants.TOGGLE_STICKY_CELL:
      return toggleStickyCell(state, action);
    case constants.UPDATE_CELL_EXECUTION_COUNT:
      return updateExecutionCount(state, action);
    case constants.MOVE_CELL:
      return moveCell(state, action);
    case constants.REMOVE_CELL:
      return removeCellFromState(state, action);
    case constants.NEW_CELL_AFTER:
      return newCellAfter(state, action);
    case constants.NEW_CELL_BEFORE:
      return newCellBefore(state, action);
    case constants.MERGE_CELL_AFTER:
      return mergeCellAfter(state, action);
    case constants.NEW_CELL_APPEND:
      return newCellAppend(state, action);
    case constants.UPDATE_CELL_SOURCE:
      return updateSource(state, action);
    case constants.CHANGE_OUTPUT_VISIBILITY:
      return changeOutputVisibility(state, action);
    case constants.CHANGE_INPUT_VISIBILITY:
      return changeInputVisibility(state, action);
    case constants.UPDATE_CELL_PAGERS:
      return updateCellPagers(state, action);
    case constants.UPDATE_CELL_STATUS:
      return updateCellStatus(state, action);
    case constants.SET_LANGUAGE_INFO:
      return setLanguageInfo(state, action);
    case constants.SET_KERNEL_INFO:
      return setKernelSpec(state, action);
    case constants.OVERWRITE_METADATA_FIELD:
      return overwriteMetadata(state, action);
    case constants.DELETE_METADATA_FIELD:
      return deleteMetadata(state, action);
    case constants.COPY_CELL:
      return copyCell(state, action);
    case constants.CUT_CELL:
      return cutCell(state, action);
    case constants.PASTE_CELL:
      return pasteCell(state, action);
    case constants.CHANGE_CELL_TYPE:
      return changeCellType(state, action);
    case constants.TOGGLE_OUTPUT_EXPANSION:
      return toggleOutputExpansion(state, action);
    default:
      return state;
  }
}

export default handleDocument;
