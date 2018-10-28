import uuid from "uuid/v4";
import { Map as ImmutableMap, List as ImmutableList } from "immutable";

import {
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

// We're hardset to nbformat v4.4 for what we use in-memory
export interface Notebook {
  nbformat: 4;
  nbformat_minor: 4;
  metadata: ImmutableMap<string, ImmutableJSONType>;
  cellOrder: ImmutableList<string>;
  cellMap: ImmutableMap<string, ImmutableCell>;
}

export interface CodeCell {
  cell_type: "code";
  metadata: ImmutableMap<string, any>;
  execution_count: ExecutionCount;
  source: string;
  outputs: ImmutableList<ImmutableOutput>;
}

export interface MarkdownCell {
  cell_type: "markdown";
  source: string;
  metadata: ImmutableMap<string, any>;
}

const defaultCodeCell = Object.freeze({
  cell_type: "code",
  execution_count: null,
  metadata: ImmutableMap({
    collapsed: false,
    outputHidden: false,
    inputHidden: false
  }),
  source: "",
  outputs: ImmutableList()
}) as CodeCell;

const defaultMarkdownCell = Object.freeze({
  cell_type: "markdown",
  metadata: ImmutableMap(),
  source: ""
}) as MarkdownCell;

export const createCodeCell = (cell = defaultCodeCell): ImmutableCodeCell =>
  ImmutableMap(cell);

export const createMarkdownCell = (
  cell = defaultMarkdownCell
): ImmutableMarkdownCell => ImmutableMap(cell);

export const emptyCodeCell = createCodeCell();
export const emptyMarkdownCell = createMarkdownCell();

export const defaultNotebook = Object.freeze({
  nbformat: 4,
  nbformat_minor: 4,
  metadata: ImmutableMap(),
  cellOrder: ImmutableList(),
  cellMap: ImmutableMap()
}) as Notebook;

export const createNotebook = (notebook = defaultNotebook): ImmutableNotebook =>
  ImmutableMap(notebook);

export const emptyNotebook = createNotebook();

export type CellStructure = {
  cellOrder: ImmutableCellOrder;
  cellMap: ImmutableCellMap;
};

// Intended to make it easy to use this with (temporary mutable cellOrder +
// cellMap)
export const appendCell = (
  cellStructure: CellStructure,
  immutableCell: ImmutableCell,
  id: string = uuid()
): CellStructure => ({
  cellOrder: cellStructure.cellOrder.push(id),
  cellMap: cellStructure.cellMap.set(id, immutableCell)
});

export const appendCellToNotebook = (
  immnb: ImmutableNotebook,
  immCell: ImmutableCell
): ImmutableNotebook =>
  immnb.withMutations(nb => {
    // $FlowFixMe: Fixed by making ImmutableNotebook a typed Record.
    const cellStructure: CellStructure = {
      cellOrder: nb.get("cellOrder"),
      // $FlowFixMe: Fixed by making ImmutableNotebook a typed Record.
      cellMap: nb.get("cellMap")
    };
    const { cellOrder, cellMap } = appendCell(cellStructure, immCell);
    return nb.set("cellOrder", cellOrder).set("cellMap", cellMap);
  });

export const insertCellAt = (
  notebook: ImmutableNotebook,
  cell: ImmutableCell,
  cellID: string,
  index: number
): ImmutableNotebook =>
  notebook.withMutations(nb =>
    nb
      .setIn(["cellMap", cellID], cell)
      // $FlowFixMe: Fixed by making ImmutableNotebook a typed record.
      .set("cellOrder", nb.get("cellOrder").insert(index, cellID))
  );

export const insertCellAfter = (
  notebook: ImmutableNotebook,
  cell: ImmutableCell,
  cellID: string,
  priorCellID: string
): ImmutableNotebook =>
  insertCellAt(
    notebook,
    cell,
    cellID,
    // $FlowFixMe: Fixed by making ImmutableNotebook a typed record.
    notebook.get("cellOrder").indexOf(priorCellID) + 1
  );

// Deprecation Warning: removeCell() is being deprecated.
// Please use deleteCell() instead
export const removeCell = (
  notebook: ImmutableNotebook,
  cellID: string
): ImmutableNotebook => {
  console.log(
    "Deprecation Warning: removeCell() is being deprecated. Please use deleteCell() instead"
  );
  return notebook
    .removeIn(["cellMap", cellID])
    .update("cellOrder", (cellOrder: ImmutableCellOrder) =>
      cellOrder.filterNot(id => id === cellID)
    );
};

export const deleteCell = (
  notebook: ImmutableNotebook,
  cellID: string
): ImmutableNotebook =>
  notebook
    .removeIn(["cellMap", cellID])
    .update("cellOrder", (cellOrder: ImmutableCellOrder) =>
      cellOrder.filterNot(id => id === cellID)
    );

export const monocellNotebook = appendCellToNotebook(
  emptyNotebook,
  emptyCodeCell
);
