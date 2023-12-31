// Vendor modules
import * as actionTypes from "@nteract/actions";
import {
  CellId,
  createFrozenMediaBundle,
  createImmutableOutput,
  deleteCell,
  demultiline,
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  ImmutableCell,
  ImmutableCodeCell,
  ImmutableNotebook,
  ImmutableOutput,
  insertCellAfter,
  insertCellAt,
  makeCodeCell,
  makeMarkdownCell,
  makeRawCell,
  markCellDeleting,
  markCellNotDeleting,
  normalizeLineEndings,
  OnDiskDisplayData,
  OnDiskExecuteResult,
  OnDiskOutput,
  OnDiskStreamOutput,
} from "@nteract/commutable";
import { UpdateDisplayDataContent } from "@nteract/messaging";
import {
  DocumentRecordProps,
  makeDocumentRecord,
  NotebookModel,
  PayloadMessage,
} from "@nteract/types";
import { escapeCarriageReturnSafe } from "escape-carriage";
import { fromJS, List, Map, RecordOf, Set } from "immutable";
import has from "lodash.has";
import { v4 as uuid } from "uuid";

type KeyPath = List<string | number>;
type KeyPaths = List<KeyPath>;

/**
 * An output can be a stream of data that does not arrive at a single time. This
 * function handles the different types of outputs and accumulates the data
 * into a reduced output.
 *
 * @param {Object} outputs - Kernel output messages
 * @param {Object} output - Outputted to be reduced into list of outputs
 * @return {List<Object>} updated-outputs - Outputs + Output
 */
export function reduceOutputs(
  outputs: List<ImmutableOutput> = List(),
  output: OnDiskOutput
): List<ImmutableOutput> {
  // Find the last output to see if it's a stream type
  // If we don't find one, default to null
  const last = outputs.last(null);

  if (!last || !last.output_type) {
    return outputs.push(createImmutableOutput(output));
  }

  if (output.output_type !== "stream" || last.output_type !== "stream") {
    // If the last output type or the incoming output type isn't a stream
    // we just add it to the outputs
    // This is kind of like a "break" between streams if we get error,
    // display_data, execute_result, etc.
    return outputs.push(createImmutableOutput(output));
  }

  const streamOutput: OnDiskStreamOutput = output;

  if (typeof streamOutput.name === "undefined") {
    return outputs.push(createImmutableOutput(streamOutput));
  }

  function appendText(text: string): string {
    if (typeof streamOutput.text === "string") {
      return escapeCarriageReturnSafe(text + streamOutput.text);
    }
    return text;
  }

  // Invariant: size > 0, outputs.last() exists
  if (last.name === streamOutput.name) {
    return outputs.updateIn([outputs.size - 1, "text"], appendText);
  }

  // Check if there's a separate stream to merge with
  const nextToLast = outputs.butLast().last(null);

  if (
    nextToLast &&
    nextToLast.output_type === "stream" &&
    nextToLast.name === streamOutput.name
  ) {
    return outputs.updateIn([outputs.size - 2, "text"], appendText);
  }
  // If nothing else matched, just append it
  return outputs.push(createImmutableOutput(streamOutput));
}

export function cleanCellTransient(
  state: NotebookModel,
  id: string
): RecordOf<DocumentRecordProps> {
  // Clear out key paths that should no longer be referenced
  return state
    .setIn(["cellPagers", id], List())
    .updateIn(
      ["transient", "keyPathsForDisplays"],
      (kpfd: Map<string, KeyPaths>) =>
        (kpfd || Map()).map((keyPaths: KeyPaths) =>
          keyPaths.filter((keyPath: KeyPath) => keyPath.get(2) !== id)
        )
    )
    .setIn(["transient", "cellMap", id], Map());
}

function setNotebookCheckpoint(
  state: NotebookModel
): RecordOf<DocumentRecordProps> {
  // Use the current version of the notebook document
  return state.set("savedNotebook", state.get("notebook"));
}

function focusCell(
  state: NotebookModel,
  action: actionTypes.FocusCell
): RecordOf<DocumentRecordProps> {
  return state.set("cellFocused", action.payload.id);
}

function clearOutputs(
  state: NotebookModel,
  action: actionTypes.ClearOutputs
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const type = state.getIn(["notebook", "cellMap", id, "cell_type"]);

  const cleanedState = cleanCellTransient(state, id);

  if (type === "code") {
    return cleanedState
      .setIn(["notebook", "cellMap", id, "outputs"], List())
      .setIn(["notebook", "cellMap", id, "execution_count"], null)
      .setIn(["cellPrompts", id], List());
  }
  return cleanedState;
}

function toggleTagInCell(
  state: NotebookModel,
  action: actionTypes.ToggleTagInCell
): RecordOf<DocumentRecordProps> {
  const { id, tag } = action.payload;

  return state.updateIn(
    ["notebook", "cellMap", id, "metadata", "tags"],
    (tags) => {
      if (tags) {
        return tags.has(tag) ? tags.remove(tag) : tags.add(tag);
      } else {
        return Set([tag]);
      }
    }
  );
}

function clearAllOutputs(
  state: NotebookModel,
  action: actionTypes.ClearAllOutputs | actionTypes.RestartKernel
): RecordOf<DocumentRecordProps> {
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
    .getIn(["notebook", "cellMap"])
    // NOTE: My kingdom for a mergeMap
    .map((cell: ImmutableCell) => {
      if ((cell as any).get("cell_type") === "code") {
        return (cell as ImmutableCodeCell).merge({
          outputs: List(),
          execution_count: null,
        });
      }
      return cell;
    });

  // Clear all the transient data too
  const transient = Map({
    keyPathsForDisplays: Map(),
    cellMap: cellMap.map(() => Map()),
  });

  return state
    .setIn(["notebook", "cellMap"], cellMap)
    .set("transient", transient)
    .set("cellPrompts", Map());
}

type UpdatableOutputContent =
  | OnDiskExecuteResult
  | OnDiskDisplayData
  | UpdateDisplayDataContent;

// Utility function used in two reducers below
function updateAllDisplaysWithID(
  state: NotebookModel,
  content: UpdatableOutputContent
): NotebookModel {
  if (!content || !content.transient || !content.transient.display_id) {
    return state;
  }

  const keyPaths: KeyPaths =
    state.getIn([
      "transient",
      "keyPathsForDisplays",
      content.transient.display_id,
    ]) || List();

  const updateOutput = (output: any) => {
    if (output) {
      // We already have something here, don't change the other fields
      return output.merge({
        data: createFrozenMediaBundle(content.data),
        metadata: fromJS(content.metadata || {}),
      });
    } else if (content.output_type === "update_display_data") {
      // Nothing here and we have no valid output, just create a basic output
      return {
        data: createFrozenMediaBundle(content.data),
        metadata: fromJS(content.metadata || {}),
        output_type: "display_data",
      };
    } else {
      // Nothing here, but we have a valid output
      return createImmutableOutput(content);
    }
  };

  const updateOneDisplay = (currState: NotebookModel, keyPath: KeyPath) =>
    currState.updateIn(keyPath, updateOutput);

  return keyPaths.reduce(updateOneDisplay, state);
}

function appendOutput(
  state: NotebookModel,
  action: actionTypes.AppendOutput
): RecordOf<DocumentRecordProps> {
  const output = action.payload.output;
  const cellId = action.payload.id;

  /**
   * If it is not a display_data or execute_result with
   * a display_id, then treat it as a normal output and don't
   * add its index to the keyPaths.
   */
  if (
    (output.output_type !== "execute_result" &&
      output.output_type !== "display_data") ||
    !has(output, "transient.display_id")
  ) {
    return state.updateIn(
      ["notebook", "cellMap", cellId, "outputs"],
      (outputs: List<ImmutableOutput>): List<ImmutableOutput> =>
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
  const displayID = output.transient!.display_id;

  if (!displayID || typeof displayID !== "string") {
    return state;
  }

  // Every time we see a display id we're going to capture the keypath
  // to the output

  // Determine the next output index
  const outputIndex = state
    .getIn(["notebook", "cellMap", cellId, "outputs"])
    .count();

  // Construct the path to the output for updating later
  const keyPath: KeyPath = List([
    "notebook",
    "cellMap",
    cellId,
    "outputs",
    outputIndex,
  ]);

  const keyPaths: KeyPaths = (
    state
      // Extract the current list of keypaths for this displayID
      .getIn(["transient", "keyPathsForDisplays", displayID]) || List()
  )
    // Append our current output's keyPath
    .push(keyPath);

  return updateAllDisplaysWithID(
    state.setIn(["transient", "keyPathsForDisplays", displayID], keyPaths),
    output
  );
}

function updateDisplay(
  state: NotebookModel,
  action: actionTypes.UpdateDisplay
): RecordOf<DocumentRecordProps> {
  return updateAllDisplaysWithID(state, action.payload.content);
}

function focusNextCell(
  state: NotebookModel,
  action: actionTypes.FocusNextCell
): RecordOf<DocumentRecordProps> {
  const cellOrder = state.getIn(["notebook", "cellOrder"]);

  const id = action.payload.id ? action.payload.id : state.get("cellFocused");
  // If for some reason we neither have an ID here or a focused cell, we just
  // keep the state consistent
  if (!id) {
    return state;
  }

  const curIndex = cellOrder.findIndex((foundId: CellId) => id === foundId);
  const curCellType = state.getIn(["notebook", "cellMap", id, "cell_type"]);

  const nextIndex = curIndex + 1;

  // When at the end, create a new cell
  if (nextIndex >= cellOrder.size) {
    if (!action.payload.createCellIfUndefined) {
      return state;
    }

    const cellId: string = uuid();
    const cell = curCellType === "code" ? emptyCodeCell : emptyMarkdownCell;

    const notebook: ImmutableNotebook = state.get("notebook");

    return state
      .set("cellFocused", cellId)
      .set("notebook", insertCellAt(notebook, cell, cellId, nextIndex));
  }

  // When in the middle of the notebook document, move to the next cell
  return state.set("cellFocused", cellOrder.get(nextIndex));
}

function focusPreviousCell(
  state: NotebookModel,
  action: actionTypes.FocusPreviousCell
): RecordOf<DocumentRecordProps> {
  const cellOrder = state.getIn(["notebook", "cellOrder"]);
  const curIndex = cellOrder.findIndex(
    (id: CellId) => id === action.payload.id
  );
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set("cellFocused", cellOrder.get(nextIndex));
}

function focusCellEditor(
  state: NotebookModel,
  action: actionTypes.FocusCellEditor
): RecordOf<DocumentRecordProps> {
  return state.set("editorFocused", action.payload.id);
}

function focusNextCellEditor(
  state: NotebookModel,
  action: actionTypes.FocusNextCellEditor
): RecordOf<DocumentRecordProps> {
  const cellOrder: List<CellId> = state.getIn(["notebook", "cellOrder"]);

  const id = action.payload.id ? action.payload.id : state.get("editorFocused");

  // If for some reason we neither have an ID here or a focused editor, we just
  // keep the state consistent
  if (!id) {
    return state;
  }

  const curIndex = cellOrder.findIndex((foundId: CellId) => id === foundId);
  const nextIndex = curIndex + 1;

  return state.set("editorFocused", cellOrder.get(nextIndex));
}

function focusPreviousCellEditor(
  state: NotebookModel,
  action: actionTypes.FocusPreviousCellEditor
): RecordOf<DocumentRecordProps> {
  const cellOrder: List<CellId> = state.getIn(["notebook", "cellOrder"]);
  const curIndex = cellOrder.findIndex(
    (id: CellId) => id === action.payload.id
  );
  const nextIndex = Math.max(0, curIndex - 1);

  return state.set("editorFocused", cellOrder.get(nextIndex));
}

function moveCell(
  state: NotebookModel,
  action: actionTypes.MoveCell
): RecordOf<DocumentRecordProps> {
  return state.updateIn(
    ["notebook", "cellOrder"],
    (cellOrder: List<CellId>) => {
      const oldIndex = cellOrder.findIndex(
        (id: string) => id === action.payload.id
      );
      const newIndex =
        cellOrder.findIndex(
          (id: string) => id === action.payload.destinationId
        ) + (action.payload.above ? 0 : 1);
      if (oldIndex === newIndex) {
        return cellOrder;
      }
      return cellOrder
        .splice(oldIndex, 1)
        .splice(newIndex - (oldIndex < newIndex ? 1 : 0), 0, action.payload.id);
    }
  );
}

function markCellAsDeleting(
  state: NotebookModel,
  action: actionTypes.MarkCellAsDeleting
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }
  return state.update("notebook", (notebook: ImmutableNotebook) =>
    markCellDeleting(notebook, id)
  );
}

function unmarkCellAsDeleting(
  state: NotebookModel,
  action: actionTypes.UnmarkCellAsDeleting
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }
  return state.update("notebook", (notebook: ImmutableNotebook) =>
    markCellNotDeleting(notebook, id)
  );
}

function deleteCellFromState(
  state: NotebookModel,
  action: actionTypes.DeleteCell
): RecordOf<DocumentRecordProps> {
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
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { cellType } = action.payload;
  let cell: ImmutableCell =
    cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  if (action.payload.cell) {
    cell = action.payload.cell;
  }

  const cellId = uuid();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const index = notebook.get("cellOrder", List()).indexOf(id) + 1;
    return insertCellAt(notebook, cell, cellId, index);
  });
}

function createCellAbove(
  state: NotebookModel,
  action: actionTypes.CreateCellAbove
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { cellType } = action.payload;
  let cell: ImmutableCell =
    cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell;
  if (action.payload.cell) {
    cell = action.payload.cell;
  }
  const cellId = uuid();
  return state.update("notebook", (notebook: ImmutableNotebook) => {
    const cellOrder: List<CellId> = notebook.get("cellOrder", List());
    const index = cellOrder.indexOf(id);
    return insertCellAt(notebook, cell, cellId, index);
  });
}

function createCellAppend(
  state: NotebookModel,
  action: actionTypes.CreateCellAppend
): RecordOf<DocumentRecordProps> {
  const { cellType } = action.payload;
  const notebook: ImmutableNotebook = state.get("notebook");
  const cellOrder: List<CellId> = notebook.get("cellOrder", List());
  const cell: ImmutableCell = action.payload.cell ?? (cellType === "markdown" ? emptyMarkdownCell : emptyCodeCell);
  const index = cellOrder.count();
  const cellId = uuid();
  return state.set("notebook", insertCellAt(notebook, cell, cellId, index));
}

function acceptPayloadMessage(
  state: NotebookModel,
  action: actionTypes.AcceptPayloadMessage
): NotebookModel {
  const id: string = action.payload.id;
  const payload: PayloadMessage = action.payload.payload;

  if (payload.source === "page") {
    // append pager
    return state.updateIn(["cellPagers", id], (l) =>
      (l || List()).push(payload.data)
    );
  } else if (payload.source === "set_next_input") {
    if (payload.replace) {
      // this payload is sent in IPython when you use %load
      // and is intended to replace cell source
      return state.setIn(["notebook", "cellMap", id, "source"], normalizeLineEndings(payload.text));
    } else {
      // create the next cell
      // FIXME: This is a weird pattern. We're basically faking a dispatch here
      // inside a reducer and then appending to the result. I think that both of
      // these reducers should just handle the original action.
      return createCellBelow(state, {
        type: actionTypes.CREATE_CELL_BELOW,
        payload: {
          cellType: "code",
          cell: makeCodeCell({ source: payload.text || "" }),
          id,
          contentRef: action.payload.contentRef,
        },
      });
    }
  }
  // If the payload is unsupported, just return the current state
  return state;
}

function setInCell(
  state: NotebookModel,
  action: actionTypes.SetInCell<string>
): RecordOf<DocumentRecordProps> {
  const { id, path } = action.payload;
  let value = action.payload.value;

  if (path.length === 1 && path[0] === "source") {
    value = normalizeLineEndings(demultiline(value)) ?? "";
  }

  return state.setIn(["notebook", "cellMap", id].concat(path), value);
}

function toggleCellOutputVisibility(
  state: NotebookModel,
  action: actionTypes.ToggleCellOutputVisibility
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "jupyter", "outputs_hidden"],
    !state.getIn([
      "notebook",
      "cellMap",
      id,
      "metadata",
      "jupyter",
      "outputs_hidden",
    ])
  );
}

function unhideAll(
  state: NotebookModel,
  action: actionTypes.UnhideAll
): RecordOf<DocumentRecordProps> {
  const { outputHidden, inputHidden } = action.payload;
  let metadataMixin = Map<string, boolean>();

  if (outputHidden !== undefined) {
    metadataMixin = metadataMixin.set("outputs_hidden", outputHidden);
  }
  if (inputHidden !== undefined) {
    metadataMixin = metadataMixin.set("source_hidden", inputHidden);
  }

  return state.updateIn(["notebook", "cellMap"], (cellMap) =>
    cellMap.map((cell: ImmutableCell) => {
      if ((cell as any).get("cell_type") === "code") {
        return cell.mergeIn(["metadata", "jupyter"], metadataMixin);
      }
      return cell;
    })
  );
}

function toggleCellInputVisibility(
  state: NotebookModel,
  action: actionTypes.ToggleCellInputVisibility
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  return state.setIn(
    ["notebook", "cellMap", id, "metadata", "jupyter", "source_hidden"],
    !state.getIn([
      "notebook",
      "cellMap",
      id,
      "metadata",
      "jupyter",
      "source_hidden",
    ])
  );
}

function updateCellStatus(
  state: NotebookModel,
  action: actionTypes.UpdateCellStatus
): RecordOf<DocumentRecordProps> {
  const { id, status } = action.payload;
  return state.setIn(["transient", "cellMap", id, "status"], status);
}

function updateCellExecutionResult(
  state: NotebookModel,
  action: actionTypes.UpdateCellExecutionResult
): RecordOf<DocumentRecordProps> {
  const { id, result } = action.payload;
  return state.setIn(["transient", "cellMap", id, "executionResult"], result);
}

function updateOutputMetadata(
  state: NotebookModel,
  action: actionTypes.UpdateOutputMetadata
): RecordOf<DocumentRecordProps> {
  const { id, metadata, index, mediaType } = action.payload;
  const currentOutputs = state.getIn(["notebook", "cellMap", id, "outputs"]);

  const updatedOutputs = currentOutputs.update(index, (item: any) =>
    item.set(
      "metadata",
      fromJS({
        [mediaType]: metadata,
      })
    )
  );

  return state.setIn(["notebook", "cellMap", id, "outputs"], updatedOutputs);
}

function setLanguageInfo(
  state: NotebookModel,
  action: actionTypes.SetLanguageInfo
): RecordOf<DocumentRecordProps> {
  const langInfo = fromJS(action.payload.langInfo);
  return state.setIn(["notebook", "metadata", "language_info"], langInfo);
}

function setKernelMetadata(
  state: NotebookModel,
  action: actionTypes.SetKernelMetadata
): RecordOf<DocumentRecordProps> {
  const { kernelInfo } = action.payload;
  if (kernelInfo) {
    return state
      .setIn(
        ["notebook", "metadata", "kernelspec"],
        fromJS({
          name: kernelInfo.name,
          language: kernelInfo.language,
          display_name: kernelInfo.displayName,
        })
      )
      .setIn(["notebook", "metadata", "kernel_info", "name"], kernelInfo.name);
  }
  return state;
}

function overwriteMetadataField(
  state: NotebookModel,
  action: actionTypes.OverwriteMetadataField
): RecordOf<DocumentRecordProps> {
  const { field, value } = action.payload;
  return state.setIn(["notebook", "metadata", field], fromJS(value));
}
function deleteMetadataField(
  state: NotebookModel,
  action: actionTypes.DeleteMetadataField
): RecordOf<DocumentRecordProps> {
  const { field } = action.payload;
  return state.deleteIn(["notebook", "metadata", field]);
}

function copyCell(
  state: NotebookModel,
  action: actionTypes.CopyCell
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id || state.cellFocused;

  const cell = state.getIn(["notebook", "cellMap", id]);
  if (!cell) {
    return state;
  }
  return state.set("copied", cell);
}

function cutCell(
  state: NotebookModel,
  action: actionTypes.CutCell
): RecordOf<DocumentRecordProps> {
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

function pasteCell(state: NotebookModel): RecordOf<DocumentRecordProps> {
  const copiedCell = state.get("copied");

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
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  const { to } = action.payload;

  const cell = state.getIn(["notebook", "cellMap", id]);

  const from = cell.cell_type;

  // NOOP, since we're already that cell type
  if (from === to) {
    return state;
  }

  let nextState = state;

  // from === "code"
  if (from === "code") {
    nextState = cleanCellTransient(
      state
        .deleteIn(["notebook", "cellMap", id, "execution_count"])
        .deleteIn(["notebook", "cellMap", id, "outputs"]),
      id
    );
  }

  switch (to) {
    case "code":
      return nextState.setIn(
        ["notebook", "cellMap", id],
        makeCodeCell({
          source: cell.source,
        })
      );
    case "markdown":
      return nextState.setIn(
        ["notebook", "cellMap", id],
        makeMarkdownCell({
          source: cell.source,
        })
      );
    case "raw":
      return nextState.setIn(
        ["notebook", "cellMap", id],
        makeRawCell({
          source: cell.source,
        })
      );
  }

  // If we didn't match on the `to`, we should change nothing as we don't implement
  // other cell types (as there aren't any)
  return state;
}

function toggleOutputExpansion(
  state: NotebookModel,
  action: actionTypes.ToggleCellExpansion
): RecordOf<DocumentRecordProps> {
  const id = action.payload.id ? action.payload.id : state.cellFocused;
  if (!id) {
    return state;
  }

  return state.updateIn(
    ["notebook", "cellMap"],
    (cells: Map<CellId, ImmutableCell>) => {
      const scrolled = cells.getIn([id, "metadata", "scrolled"]);
      const isCurrentlyScrolled = scrolled !== false;
      return cells.setIn(
        [id, "metadata", "scrolled"],
        !isCurrentlyScrolled
      )
    }
  );
}

function promptInputRequest(
  state: NotebookModel,
  action: actionTypes.PromptInputRequest
): RecordOf<DocumentRecordProps> {
  const { id, password, prompt } = action.payload;
  return state.updateIn(["cellPrompts", id], (prompts) =>
    prompts.push({
      prompt,
      password,
    })
  );
}

function interruptKernelSuccessful(
  state: NotebookModel,
  action: actionTypes.InterruptKernelSuccessful
): RecordOf<DocumentRecordProps> {
  return state.updateIn(["transient", "cellMap"], (cells) =>
    cells.map((cell: Map<string, string>) => {
      if (cell.get("status") === "queued" || cell.get("status") === "running") {
        return cell.set("status", "");
      }
      return cell;
    })
  );
}

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
  | actionTypes.MarkCellAsDeleting
  | actionTypes.UnmarkCellAsDeleting
  | actionTypes.DeleteCell
  | actionTypes.CreateCellBelow
  | actionTypes.CreateCellAbove
  | actionTypes.CreateCellAppend
  | actionTypes.ToggleCellOutputVisibility
  | actionTypes.ToggleCellInputVisibility
  | actionTypes.UpdateCellStatus
  | actionTypes.UpdateCellExecutionResult
  | actionTypes.UpdateOutputMetadata
  | actionTypes.SetLanguageInfo
  | actionTypes.SetKernelMetadata
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
  | actionTypes.SetInCell<any>
  | actionTypes.UnhideAll
  | actionTypes.PromptInputRequest
  | actionTypes.InterruptKernelSuccessful;

const defaultDocument: NotebookModel = makeDocumentRecord({
  notebook: emptyNotebook,
});

export function notebook(
  state: NotebookModel = defaultDocument,
  action: DocumentAction
): RecordOf<DocumentRecordProps> {
  switch (action.type) {
    case actionTypes.TOGGLE_TAG_IN_CELL:
      return toggleTagInCell(state, action);
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
    case actionTypes.MARK_CELL_AS_DELETING:
      return markCellAsDeleting(state, action);
    case actionTypes.UNMARK_CELL_AS_DELETING:
      return unmarkCellAsDeleting(state, action);
    case actionTypes.DELETE_CELL:
      return deleteCellFromState(state, action);
    case actionTypes.CREATE_CELL_BELOW:
      return createCellBelow(state, action);
    case actionTypes.CREATE_CELL_ABOVE:
      return createCellAbove(state, action);
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
    case actionTypes.UPDATE_CELL_EXECUTION_RESULT:
      return updateCellExecutionResult(state, action);
    case actionTypes.UPDATE_OUTPUT_METADATA:
      return updateOutputMetadata(state, action);
    case actionTypes.SET_LANGUAGE_INFO:
      return setLanguageInfo(state, action);
    case actionTypes.SET_KERNEL_METADATA:
      return setKernelMetadata(state, action);
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
    case actionTypes.PROMPT_INPUT_REQUEST:
      return promptInputRequest(state, action);
    case actionTypes.INTERRUPT_KERNEL_SUCCESSFUL:
      return interruptKernelSuccessful(state, action);
    default:
      return state;
  }
}
