// @flow

import uuid from "uuid/v4";
import * as Immutable from "immutable";
import type {
  ImmutableCell,
  ImmutableCellMap,
  ImmutableNotebook,
  CellID,
  ImmutableCellOrder,
  ImmutableOutput,
  ImmutableOutputs
} from "@nteract/commutable";
import {
  emptyCodeCell,
  emptyMarkdownCell,
  insertCellAt,
  insertCellAfter,
  deleteCell,
  emptyNotebook,
  createImmutableOutput,
  createImmutableMimeBundle
} from "@nteract/commutable";
import { has } from "lodash";
import type { Output, StreamOutput } from "@nteract/commutable/src/v4";
import { escapeCarriageReturnSafe } from "escape-carriage";

import * as actionTypes from "../../../../actionTypes";
import { makeDocumentRecord } from "../../../../state/entities/contents";
import type { NotebookModel } from "../../../../state/entities/contents";

type KeyPath = Immutable.List<string | number>;
type KeyPaths = Immutable.List<KeyPath>;

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
  const last = outputs.last();

  if (
    output.output_type !== "stream" ||
    !last ||
    (outputs.size > 0 && last.get("output_type") !== "stream")
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
    last &&
    outputs.size > 0 &&
    typeof streamOutput.name !== "undefined" &&
    last.get("output_type") === "stream"
  ) {
    // Invariant: size > 0, outputs.last() exists
    if (last.get("name") === streamOutput.name) {
      return outputs.updateIn([outputs.size - 1, "text"], appendText);
    }
    const nextToLast: ?ImmutableOutput = outputs.butLast().last();
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

export function cleanCellTransient(state: NotebookModel, id: string) {
  // Clear out key paths that should no longer be referenced
  return state
    .setIn(["cellPagers", id], new Immutable.List())
    .updateIn(
      ["transient", "keyPathsForDisplays"],
      Immutable.Map(),
      (kpfd: Immutable.Map<string, KeyPaths>) =>
        kpfd.map((keyPaths: KeyPaths) =>
          keyPaths.filter((keyPath: KeyPath) => keyPath.get(2) !== id)
        )
    )
    .setIn(["transient", "cellMap", id], new Immutable.Map());
}

function setNotebookCheckpoint(state: NotebookModel) {
  // Use the current version of the notebook document
  return state.set("savedNotebook", state.get("notebook"));
}

function focusCell(state: NotebookModel, action: actionTypes.FocusCell) {
  return state.set("cellFocused", action.payload.id);
}

function clearOutputs(state: NotebookModel, action: actionTypes.ClearOutputs) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const type = state.getIn(["notebook", "cellMap", id, "cell_type"]);

  const cleanedState = cleanCellTransient(state, id);

  if (type === "code") {
    return cleanedState
      .setIn(["notebook", "cellMap", id, "outputs"], new Immutable.List())
      .setIn(["notebook", "cellMap", id, "execution_count"], null);
  }
  return cleanedState;
}

function toggleTagInCell(
  state: NotebookModel,
  action: actionTypes.ToggleTagInCell
): NotebookModel {
  const { id, tag } = action.payload;

  return state.updateIn(
    ["notebook", "cellMap", id, "metadata", "tags"],
    // When tags haven't been initialized, we set them up as a new set
    Immutable.Set(),
    tags => (tags.has(tag) ? tags.remove(tag) : tags.add(tag))
  );
}

function clearAllOutputs(
  state: NotebookModel,
  action: actionTypes.ClearAllOutputs | actionTypes.RestartKernel
) {
  // If we get a restart kernel action that said to clear outputs, we'll
  // handle it
  if (
    action.type === actionTypes.RESTART_KERNEL &&
    action.payload.outputHandling !== "Clear All"
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

function appendOutput(state: NotebookModel, action: actionTypes.AppendOutput) {
  const output = action.payload.output;
  const cellID = action.payload.id;

  // If it's display data and it doesn't have a display id, fold it in like non
  // display data
  if (
    output.output_type !== "display_data" ||
    !has(output, "transient.display_id")
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
      (currState: NotebookModel, kp: KeyPath) =>
        // $FlowFixMe
        currState.setIn(kp, immutableOutput),
      state
    )
    .setIn(["transient", "keyPathsForDisplays", displayID], keyPaths);
}

function updateDisplay(
  state: NotebookModel,
  action: actionTypes.UpdateDisplay
) {
  const { content } = action.payload;
  if (!(content && content.transient && content.transient.display_id)) {
    return state;
  }
  const displayID = content.transient.display_id;

  const keyPaths: KeyPaths = state.getIn(
    ["transient", "keyPathsForDisplays", displayID],
    new Immutable.List()
  );

  const updatedContent = {
    // $FlowFixMe: Not sure why this isn't accepted as mimebundle
    data: createImmutableMimeBundle(content.data),
    metadata: Immutable.fromJS(content.metadata || {})
  };

  return keyPaths.reduce(
    (currState: NotebookModel, kp: KeyPath) =>
      // $FlowFixMe: gnarly one we need to FIXME
      currState.updateIn(kp, output => {
        return output.merge(updatedContent);
      }),
    state
  );
}

function focusNextCell(
  state: NotebookModel,
  action: actionTypes.FocusNextCell
) {
  const cellOrder = state.getIn(["notebook", "cellOrder"], Immutable.List());

  const id = action.payload.id ? action.payload.id : state.get("cellFocused");
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
    if (!action.payload.createCellIfUndefined) {
      return state;
    }

    const cellID: string = uuid();
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
  state: NotebookModel,
  action: actionTypes.FocusPreviousCell
): NotebookModel {
  const cellOrder = state.getIn(["notebook", "cellOrder"], Immutable.List());
  const curIndex = cellOrder.findIndex(
    (id: CellID) => id === action.payload.id
  );
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set("cellFocused", cellOrder.get(nextIndex));
}

function focusCellEditor(
  state: NotebookModel,
  action: actionTypes.FocusCellEditor
) {
  return state.set("editorFocused", action.payload.id);
}

function focusNextCellEditor(
  state: NotebookModel,
  action: actionTypes.FocusNextCellEditor
) {
  const cellOrder: ImmutableCellOrder = state.getIn(
    ["notebook", "cellOrder"],
    Immutable.List()
  );

  const id = action.payload.id ? action.payload.id : state.get("editorFocused");

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
  state: NotebookModel,
  action: actionTypes.FocusPreviousCellEditor
) {
  const cellOrder: ImmutableCellOrder = state.getIn(
    ["notebook", "cellOrder"],
    Immutable.List()
  );
  const curIndex = cellOrder.findIndex(
    (id: CellID) => id === action.payload.id
  );
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set("editorFocused", cellOrder.get(nextIndex));
}

function moveCell(state: NotebookModel, action: actionTypes.MoveCell) {
  return state.updateIn(
    ["notebook", "cellOrder"],
    (cellOrder: ImmutableCellOrder) => {
      const oldIndex = cellOrder.findIndex(id => id === action.payload.id);
      const newIndex =
        cellOrder.findIndex(id => id === action.payload.destinationId) +
        (action.payload.above ? 0 : 1);
      if (oldIndex === newIndex) {
        return cellOrder;
      }
      return cellOrder
        .splice(oldIndex, 1)
        .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.payload.id);
    }
  );
}

// DEPRECATION WARNING: The action type RemoveCell is being deprecated. Please use DeleteCell instead
function deleteCellFromState(
  state: NotebookModel,
  action: actionTypes.DeleteCell | actionTypes.RemoveCell
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }
  return cleanCellTransient(
    state.update("notebook", (notebook: ImmutableNotebook) =>
      deleteCell(notebook, id)
    ),
    id
  );
}

function createCellBelow(
  state: NotebookModel,
  action: actionTypes.CreateCellBelow
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { cellType, source } = action.payload;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const index = notebook.get("cellOrder", Immutable.List()).indexOf(id) + 1;
    return insertCellAt(notebook, cell.set("source", source), cellID, index);
  });
}

function createCellAbove(
  state: NotebookModel,
  action: actionTypes.CreateCellAbove
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { cellType } = action.payload;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const cellOrder: ImmutableCellOrder = notebook.get(
      "cellOrder",
      Immutable.List()
    );
    const index = cellOrder.indexOf(id);
    return insertCellAt(notebook, cell, cellID, index);
  });
}

function createCellAfter(
  state: NotebookModel,
  action: actionTypes.CreateCellAfter
) {
  console.log(
    "DEPRECATION WARNING: This function is being deprecated. Please use createCellBelow() instead"
  );
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { cellType, source } = action.payload;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const index = notebook.get("cellOrder", Immutable.List()).indexOf(id) + 1;
    return insertCellAt(notebook, cell.set("source", source), cellID, index);
  });
}

function createCellBefore(
  state: NotebookModel,
  action: actionTypes.CreateCellBefore
) {
  console.log(
    "DEPRECATION WARNING: This function is being deprecated. Please use createCellAbove() instead"
  );
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { cellType } = action.payload;
  const cell = cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const cellID = uuid();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const cellOrder: ImmutableCellOrder = notebook.get(
      "cellOrder",
      Immutable.List()
    );
    const index = cellOrder.indexOf(id);
    return insertCellAt(notebook, cell, cellID, index);
  });
}

function createCellAppend(
  state: NotebookModel,
  action: actionTypes.CreateCellAppend
) {
  const { cellType } = action.payload;
  const notebook: ImmutableNotebook = state.get("notebook");
  const cellOrder: ImmutableCellOrder = notebook.get(
    "cellOrder",
    Immutable.List()
  );
  const cell: ImmutableCell =
    cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  const index = cellOrder.count();
  const cellID = uuid();
  return state.set("notebook", insertCellAt(notebook, cell, cellID, index));
}

function acceptPayloadMessage(
  state: NotebookModel,
  action: actionTypes.AcceptPayloadMessage
): NotebookModel {
  const { id, payload } = action.payload;

  if (payload.source === "page") {
    // append pager
    return state.updateIn(["cellPagers", id], Immutable.List(), l =>
      l.push(payload.data)
    );
  } else if (payload.source === "set_next_input") {
    if (payload.replace) {
      // this payload is sent in IPython when you use %load
      // and is intended to replace cell source
      return state.setIn(["notebook", "cellMap", id, "source"], payload.text);
    } else {
      // create the next cell
      // FIXME: This is a weird pattern. We're basically faking a dispatch here
      // inside a reducer and then appending to the result. I think that both of
      // these reducers should just handle the original action.
      return createCellBelow(state, {
        type: actionTypes.CREATE_CELL_BELOW,
        // $FlowFixMe: Switch this over to creating a cell after without having to take an action
        payload: {
          cellType: "code",
          // TODO: is payload.text guaranteed to be defined?
          source: payload.text || "",
          id
        }
      });
    }
  }
  // If the payload is unsupported, just return the current state
  return state;
}

function sendExecuteRequest(
  state: NotebookModel,
  action: actionTypes.SendExecuteRequest
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  // TODO: Record the last execute request for this cell

  // * Clear outputs
  // * Set status to queued, as all we've done is submit the execution request
  // FIXME: This is a weird pattern. We're basically faking a dispatch here
  // inside a reducer and then appending to the result. I think that both of
  // these reducers should just handle the original action.
  return clearOutputs(state, {
    type: "CLEAR_OUTPUTS",
    // $FlowFixMe: Switch this over to clearing outputs without having to take an action
    payload: {
      id
      // FIXME: this needs to set a contentRef
      // Since this is part of the actual document though, maybe we don't need it
      // in here -- we could basically swap the `clearOutputs` function used here
      // to be one that doesn't need a content ref
    }
  }).setIn(["transient", "cellMap", id, "status"], "queued");
}

function setInCell(state: NotebookModel, action: actionTypes.SetInCell<*>) {
  // $FlowFixMe: Flow is complaining because the first arg has unknown length?
  return state.setIn(
    ["notebook", "cellMap", action.payload.id].concat(action.payload.path),
    action.payload.value
  );
}

function toggleCellOutputVisibility(
  state: NotebookModel,
  action: actionTypes.ToggleCellOutputVisibility
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "outputHidden"],
    !state.getIn(["notebook", "cellMap", id, "metadata", "outputHidden"])
  );
}

function unhideAll(state: NotebookModel, action: actionTypes.UnhideAll) {
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
  state: NotebookModel,
  action: actionTypes.ToggleCellInputVisibility
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "inputHidden"],
    !state.getIn(["notebook", "cellMap", id, "metadata", "inputHidden"])
  );
}

function updateCellStatus(
  state: NotebookModel,
  action: actionTypes.UpdateCellStatus
) {
  const { id, status } = action.payload;
  return state.setIn(["transient", "cellMap", id, "status"], status);
}
function setLanguageInfo(
  state: NotebookModel,
  action: actionTypes.SetLanguageInfo
) {
  const langInfo = Immutable.fromJS(action.payload.langInfo);
  return state.setIn(["notebook", "metadata", "language_info"], langInfo);
}

function setKernelspecInfo(
  state: NotebookModel,
  action: actionTypes.SetKernelspecInfo
) {
  const { kernelInfo } = action.payload;
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

function overwriteMetadataField(
  state: NotebookModel,
  action: actionTypes.OverwriteMetadataField
) {
  const { field, value } = action.payload;
  return state.setIn(["notebook", "metadata", field], Immutable.fromJS(value));
}
function deleteMetadataField(
  state: NotebookModel,
  action: actionTypes.DeleteMetadataField
) {
  const { field } = action.payload;
  return state.deleteIn(["notebook", "metadata", field]);
}

function copyCell(state: NotebookModel, action: actionTypes.CopyCell) {
  let id = action.payload.id;
  if (!id) {
    id = state.cellFocused;
  }

  const cell = state.getIn(["notebook", "cellMap", id]);
  if (!cell) {
    return state;
  }
  return state.set("copied", cell);
}

function cutCell(state: NotebookModel, action: actionTypes.CutCell) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const cell = state.getIn(["notebook", "cellMap", id]);

  if (!cell) {
    return state;
  }

  // FIXME: If the cell that was cut was the focused cell, focus the cell below
  return state
    .set("copied", cell)
    .update("notebook", (notebook: ImmutableNotebook) =>
      deleteCell(notebook, id)
    );
}

function pasteCell(state: NotebookModel) {
  const copiedCell: ImmutableCell | null = state.get("copied");

  const pasteAfter = state.cellFocused;

  if (!copiedCell || !pasteAfter) {
    return state;
  }

  // Create a new cell with `id` that will come after the currently focused cell
  // using the contents of the originally copied cell
  const id = uuid();

  return state.update("notebook", (notebook: ImmutableNotebook) =>
    insertCellAfter(notebook, copiedCell, id, pasteAfter)
  );
}

function changeCellType(
  state: NotebookModel,
  action: actionTypes.ChangeCellType
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { to } = action.payload;
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
  state: NotebookModel,
  action: actionTypes.ToggleCellExpansion
) {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  return state.updateIn(["notebook", "cellMap"], (cells: ImmutableCellMap) =>
    cells.setIn(
      [id, "metadata", "outputExpanded"],
      !cells.getIn([id, "metadata", "outputExpanded"])
    )
  );
}

// DEPRECATION WARNING: Below, the following action types are being deprecated: RemoveCell, CreateCellAfter and CreateCellBefore
type DocumentAction =
  | actionTypes.ToggleTagInCell
  | actionTypes.FocusPreviousCellEditor
  | actionTypes.FocusPreviousCell
  | actionTypes.FocusNextCellEditor
  | actionTypes.FocusNextCell
  | actionTypes.FocusCellEditor
  | actionTypes.FocusCell
  | actionTypes.ClearOutputs
  | actionTypes.AppendOutput
  | actionTypes.UpdateDisplay
  | actionTypes.MoveCell
  | actionTypes.DeleteCell
  | actionTypes.RemoveCell
  | actionTypes.CreateCellBelow
  | actionTypes.CreateCellAbove
  | actionTypes.CreateCellAfter
  | actionTypes.CreateCellBefore
  | actionTypes.CreateCellAppend
  | actionTypes.ToggleCellOutputVisibility
  | actionTypes.ToggleCellInputVisibility
  | actionTypes.UpdateCellStatus
  | actionTypes.SetLanguageInfo
  | actionTypes.SetKernelspecInfo
  | actionTypes.OverwriteMetadataField
  | actionTypes.DeleteMetadataField
  | actionTypes.CopyCell
  | actionTypes.CutCell
  | actionTypes.PasteCell
  | actionTypes.ChangeCellType
  | actionTypes.ToggleCellExpansion
  | actionTypes.AcceptPayloadMessage
  | actionTypes.SendExecuteRequest
  | actionTypes.SaveFulfilled
  | actionTypes.RestartKernel
  | actionTypes.ClearAllOutputs
  | actionTypes.SetInCell<*>;

const defaultDocument: NotebookModel = makeDocumentRecord({
  notebook: emptyNotebook
});

export function notebook(
  state: NotebookModel = defaultDocument,
  action: DocumentAction
) {
  switch (action.type) {
    case actionTypes.TOGGLE_TAG_IN_CELL:
      return toggleTagInCell(state, action);
    case actionTypes.SEND_EXECUTE_REQUEST:
      return sendExecuteRequest(state, action);
    case actionTypes.SAVE_FULFILLED:
      return setNotebookCheckpoint(state);
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
    case actionTypes.SET_IN_CELL:
      return setInCell(state, action);
    case actionTypes.MOVE_CELL:
      return moveCell(state, action);
    case actionTypes.DELETE_CELL:
      return deleteCellFromState(state, action);
    case actionTypes.CREATE_CELL_BELOW:
      return createCellBelow(state, action);
    case actionTypes.CREATE_CELL_ABOVE:
      return createCellAbove(state, action);
    case actionTypes.REMOVE_CELL:
      console.log(
        "DEPRECATION WARNING: This action type is being deprecated. Please use DELETE_CELL instead"
      );
      return deleteCellFromState(state, action);
    case actionTypes.CREATE_CELL_AFTER:
      console.log(
        "DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_BELOW instead"
      );
      return createCellAfter(state, action);
    case actionTypes.CREATE_CELL_BEFORE:
      console.log(
        "DEPRECATION WARNING: This action type is being deprecated. Please use CREATE_CELL_ABOVE instead"
      );
      return createCellBefore(state, action);
    case actionTypes.CREATE_CELL_APPEND:
      return createCellAppend(state, action);
    case actionTypes.TOGGLE_CELL_OUTPUT_VISIBILITY:
      return toggleCellOutputVisibility(state, action);
    case actionTypes.TOGGLE_CELL_INPUT_VISIBILITY:
      return toggleCellInputVisibility(state, action);
    case actionTypes.ACCEPT_PAYLOAD_MESSAGE:
      return acceptPayloadMessage(state, action);
    case actionTypes.UPDATE_CELL_STATUS:
      return updateCellStatus(state, action);
    case actionTypes.SET_LANGUAGE_INFO:
      return setLanguageInfo(state, action);
    case actionTypes.SET_KERNELSPEC_INFO:
      return setKernelspecInfo(state, action);
    case actionTypes.OVERWRITE_METADATA_FIELD:
      return overwriteMetadataField(state, action);
    case actionTypes.DELETE_METADATA_FIELD:
      return deleteMetadataField(state, action);
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
    default:
      (action: empty);
      return state;
  }
}
