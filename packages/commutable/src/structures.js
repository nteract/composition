/* @flow */

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

const uuidv4 = require("uuid").v4;
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

function createCodeCell(cell: CodeCell = defaultCodeCell): ImmutableCodeCell {
  // $FlowFixMe: Immutable
  return Immutable.Map(cell);
}

function createMarkdownCell(
  cell: MarkdownCell = defaultMarkdownCell
): ImmutableMarkdownCell {
  // $FlowFixMe: Immutable
  return Immutable.Map(cell);
}

const emptyCodeCell = createCodeCell();
const emptyMarkdownCell = createMarkdownCell();

const defaultNotebook = Object.freeze({
  nbformat: 4,
  nbformat_minor: 4,
  metadata: new Immutable.Map(),
  cellOrder: new Immutable.List(),
  cellMap: new Immutable.Map()
});

function createNotebook(
  notebook: Notebook = defaultNotebook
): ImmutableNotebook {
  // $FlowFixMe: Immutable
  return Immutable.Map(notebook);
}

const emptyNotebook = createNotebook();

export type CellStructure = {
  cellOrder: ImmutableCellOrder,
  cellMap: ImmutableCellMap
};

// Intended to make it easy to use this with (temporary mutable cellOrder + cellMap)
function appendCell(
  cellStructure: CellStructure,
  immutableCell: ImmutableCell,
  id: string = uuidv4()
) {
  return {
    cellOrder: cellStructure.cellOrder.push(id),
    cellMap: cellStructure.cellMap.set(id, immutableCell)
  };
}

function appendCellToNotebook(
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

function insertCellAt(
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

function insertCellAfter(
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

function removeCell(notebook: ImmutableNotebook, cellID: string) {
  return notebook
    .removeIn(["cellMap", cellID])
    .update("cellOrder", (cellOrder: ImmutableCellOrder) =>
      cellOrder.filterNot(id => id === cellID)
    );
}

const monocellNotebook = appendCellToNotebook(emptyNotebook, emptyCodeCell);

module.exports = {
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  monocellNotebook,

  createCodeCell,
  createMarkdownCell,
  createNotebook,

  removeCell,
  insertCellAfter,
  insertCellAt,
  appendCellToNotebook,
  appendCell
};
