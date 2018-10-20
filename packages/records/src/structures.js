/* @flow */

import produce from "immer";

import type { NbformatCell } from "./cells";

import type { NbformatOutput } from "./outputs";

import type {
  ImmutableNotebook,
  ImmutableCellOrder,
  ImmutableCellMap,
  ExecutionCount
} from "./types";

import uuid from "uuid/v4";

// We're hardset to nbformat v4.4 for what we use in-memory
export type Notebook = {|
  nbformat: 4,
  nbformat_minor: 4,
  metadata: Object,
  cellOrder: Array<string>,
  cellMap: Object
|};

export type CodeCell = {|
  cell_type: "code",
  metadata: Object,
  execution_count: ExecutionCount,
  source: string,
  outputs: Array<NbformatOutput>
|};

export type MarkdownCell = {|
  cell_type: "markdown",
  source: string,
  metadata: Object
|};

const defaultCodeCell = {
  cell_type: "code",
  execution_count: null,
  metadata: {
    collapsed: false,
    outputHidden: false,
    inputHidden: false
  },
  source: "",
  outputs: []
};

const defaultMarkdownCell = {
  cell_type: "markdown",
  metadata: {},
  source: ""
};

export function createCodeCell(cell: CodeCell = defaultCodeCell): NbformatCell {
  return produce(defaultCodeCell, draft => Object.assign(draft, cell));
}

export function createMarkdownCell(
  cell: MarkdownCell = defaultMarkdownCell
): NbformatCell {
  return produce(defaultMarkdownCell, draft => Object.assign(draft, cell));
}

export const emptyCodeCell = createCodeCell();
export const emptyMarkdownCell = createMarkdownCell();

export const defaultNotebook = {
  nbformat: 4,
  nbformat_minor: 4,
  metadata: new Object(),
  cellOrder: [],
  cellMap: new Object()
};

export function createNotebook(
  notebook: Notebook = defaultNotebook
): ImmutableNotebook {
  return produce(defaultNotebook, draft => Object.assign(draft, notebook));
}

export const emptyNotebook = createNotebook();

export type CellStructure = {
  cellOrder: ImmutableCellOrder,
  cellMap: ImmutableCellMap
};

// Intended to make it easy to use this with (temporary mutable cellOrder + cellMap)
export function appendCell(
  cellStructure: CellStructure,
  immutableCell: NbformatCell,
  id: string = uuid()
) {
  cellStructure.cellMap[id] = immutableCell;
  return {
    cellOrder: cellStructure.cellOrder.push(id),
    cellMap: cellStructure.cellMap
  };
}

export function appendCellToNotebook(
  immnb: ImmutableNotebook,
  immCell: NbformatCell
): ImmutableNotebook {
  const cellStructure: CellStructure = {
    cellOrder: immnb["cellOrder"],
    cellMap: immnb["cellMap"]
  };
  const { cellOrder, cellMap } = appendCell(cellStructure, immCell);
  immnb["cellOrder"] = cellOrder;
  immnb["cellMap"] = cellMap;
  return immnb;
}

export function insertCellAt(
  notebook: ImmutableNotebook,
  cell: NbformatCell,
  cellID: string,
  index: number
): ImmutableNotebook {
  notebook["cellMap"][cellID] = cell;
  notebook["cellOrder"][index] = cellID;
  return notebook;
}

export function insertCellAfter(
  notebook: ImmutableNotebook,
  cell: NbformatCell,
  cellID: string,
  priorCellID: string
): ImmutableNotebook {
  return insertCellAt(
    notebook,
    cell,
    cellID,
    notebook["cellOrder"].indexOf(priorCellID) + 1
  );
}

export function removeCell(notebook: ImmutableNotebook, cellID: string) {
  delete notebook["cellMap"][cellID];
  notebook["cellOrder"] = notebook["cellOrder"].filter(id => id !== cellID);
  return notebook;
}

export const monocellNotebook = appendCellToNotebook(
  emptyNotebook,
  emptyCodeCell
);
