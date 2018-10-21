/* @flow */

import uuid from "uuid/v4";

import type {
  ImmutableOutput,
  ImmutableCell,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableNotebook,
  ImmutableCellOrder,
  ImmutableCellMap,
  ImmutableJSONType,
  ExecutionCount
} from "./types";

const Immutable = require("immutable");

// We're hardset to nbformat v4.4 for what we use in-memory
export type Notebook = {|
  nbformat: 4,
  nbformat_minor: 4,
  metadata: Immutable.Map<string, ImmutableJSONType>,
  cellOrder: Immutable.List<string>,
  cellMap: Immutable.Map<string, ImmutableCell>
|};

export type CodeCell = {|
  cell_type: "code",
  metadata: Immutable.Map<string, any>,
  execution_count: ExecutionCount,
  source: string,
  outputs: Immutable.List<ImmutableOutput>
|};

export type MarkdownCell = {|
  cell_type: "markdown",
  source: string,
  metadata: Immutable.Map<string, any>
|};

const defaultCodeCell = Object.freeze({
  cell_type: "code",
  execution_count: null,
  metadata: Immutable.Map({
    collapsed: false,
    outputHidden: false,
    inputHidden: false
  }),
  source: "",
  outputs: Immutable.List()
});

const defaultMarkdownCell = Object.freeze({
  cell_type: "markdown",
  metadata: Immutable.Map(),
  source: ""
});

export function createCodeCell(
  cell: CodeCell = defaultCodeCell
): ImmutableCodeCell {
  return Immutable.Map(cell);
}

export function createMarkdownCell(
  cell: MarkdownCell = defaultMarkdownCell
): ImmutableMarkdownCell {
  return Immutable.Map(cell);
}

export const emptyCodeCell = createCodeCell();
export const emptyMarkdownCell = createMarkdownCell();

export const defaultNotebook = Object.freeze({
  nbformat: 4,
  nbformat_minor: 4,
  metadata: new Immutable.Map(),
  cellOrder: new Immutable.List(),
  cellMap: new Immutable.Map()
});

export function createNotebook(
  notebook: Notebook = defaultNotebook
): ImmutableNotebook {
  return Immutable.Map(notebook);
}

export const emptyNotebook = createNotebook();

export type CellStructure = {
  cellOrder: ImmutableCellOrder,
  cellMap: ImmutableCellMap
};

// Intended to make it easy to use this with (temporary mutable cellOrder + cellMap)
export function appendCell(
  cellStructure: CellStructure,
  immutableCell: ImmutableCell,
  id: string = uuid()
) {
  return {
    cellOrder: cellStructure.cellOrder.push(id),
    cellMap: cellStructure.cellMap.set(id, immutableCell)
  };
}

export function appendCellToNotebook(
  immnb: ImmutableNotebook,
  immCell: ImmutableCell
): ImmutableNotebook {
  return immnb.withMutations(nb => {
    // $FlowFixMe: Fixed by making ImmutableNotebook a typed Record.
    const cellStructure: CellStructure = {
      cellOrder: nb.get("cellOrder"),
      // $FlowFixMe: Fixed by making ImmutableNotebook a typed Record.
      cellMap: nb.get("cellMap")
    };
    const { cellOrder, cellMap } = appendCell(cellStructure, immCell);
    return nb.set("cellOrder", cellOrder).set("cellMap", cellMap);
  });
}

export function insertCellAt(
  notebook: ImmutableNotebook,
  cell: ImmutableCell,
  cellID: string,
  index: number
): ImmutableNotebook {
  return notebook.withMutations(nb =>
    nb
      .setIn(["cellMap", cellID], cell)
      // $FlowFixMe: Fixed by making ImmutableNotebook a typed record.
      .set("cellOrder", nb.get("cellOrder").insert(index, cellID))
  );
}

export function insertCellAfter(
  notebook: ImmutableNotebook,
  cell: ImmutableCell,
  cellID: string,
  priorCellID: string
): ImmutableNotebook {
  return insertCellAt(
    notebook,
    cell,
    cellID,
    // $FlowFixMe: Fixed by making ImmutableNotebook a typed record.
    notebook.get("cellOrder").indexOf(priorCellID) + 1
  );
}

// Deprecation Warning: removeCell() is being deprecated. Please use deleteCell() instead
export function removeCell(notebook: ImmutableNotebook, cellID: string) {
  console.log("Deprecation Warning: removeCell() is being deprecated. Please use deleteCell() instead");
  return notebook
    .removeIn(["cellMap", cellID])
    .update("cellOrder", (cellOrder: ImmutableCellOrder) =>
      cellOrder.filterNot(id => id === cellID)
    );
}

export function deleteCell(notebook: ImmutableNotebook, cellID: string) {
  return notebook
    .removeIn(["cellMap", cellID])
    .update("cellOrder", (cellOrder: ImmutableCellOrder) =>
      cellOrder.filterNot(id => id === cellID)
    );
}

export const monocellNotebook = appendCellToNotebook(
  emptyNotebook,
  emptyCodeCell
);
