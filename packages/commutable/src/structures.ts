import { v4 as uuid } from "uuid";

import { CellId, createCellId } from "./primitives";

import { ImmutableCell, makeCodeCell, makeMarkdownCell } from "./cells";

import {
  List as ImmutableList,
  Map as ImmutableMap,
  Record as ImmutableRecord
} from "immutable";

// The cell creators here are a bit duplicative
export const createCodeCell = makeCodeCell;
export const createMarkdownCell = makeMarkdownCell;

export const emptyCodeCell = createCodeCell();
export const emptyMarkdownCell = createMarkdownCell();

export interface CellStructure {
  cellOrder: ImmutableList<CellId>;
  cellMap: ImmutableMap<CellId, ImmutableCell>;
}

export interface NotebookRecordParams {
  cellOrder: ImmutableList<CellId>;
  cellMap: ImmutableMap<CellId, ImmutableCell>;
  nbformat_minor: number;
  nbformat: number;
  metadata: ImmutableMap<string, any>;
}

export type ImmutableNotebook = ImmutableRecord<NotebookRecordParams> &
  Readonly<NotebookRecordParams>;

export const makeNotebookRecord = ImmutableRecord<NotebookRecordParams>({
  cellOrder: ImmutableList(),
  cellMap: ImmutableMap(),
  nbformat_minor: 5,
  nbformat: 4,
  metadata: ImmutableMap()
});

// These are all kind of duplicative now that we're on records.
// Since we export these though, they're left for
// backwards compatiblity
export const defaultNotebook = makeNotebookRecord();
export const createNotebook = makeNotebookRecord;
export const emptyNotebook = makeNotebookRecord();

/**
 * A function that appends a new cell to a CellStructure object.
 *
 * @param cellStructure The cellOrder and cellMap of the current notebook
 * @param immutableCell The cell that will be inserted into the cellStructure
 * @param id The id of the new cell, defaults to a new UUID
 *
 * @returns Cell structure with the new cell appended at the end
 */
export function appendCell(
  cellStructure: CellStructure,
  immutableCell: ImmutableCell,
  id: CellId = createCellId()
): CellStructure {
  return {
    cellOrder: cellStructure.cellOrder.push(id),
    cellMap: cellStructure.cellMap.set(id, immutableCell)
  };
}

/**
 * A function that appends a cell to an immutable notebook.
 *
 * @param immnb An immutable data structure representing the notebook that will be modified
 * @param immCell The new cell that will be inserted into the notebook
 *
 * @returns The modified notebook
 */
export function appendCellToNotebook(
  immnb: ImmutableNotebook,
  immCell: ImmutableCell
): ImmutableNotebook {
  return immnb.withMutations(nb => {
    const cellStructure: CellStructure = {
      cellOrder: nb.get("cellOrder"),
      cellMap: nb.get("cellMap")
    };
    const { cellOrder, cellMap } = appendCell(cellStructure, immCell);
    return nb.set("cellOrder", cellOrder).set("cellMap", cellMap);
  });
}

/**
 * Inserts a cell with cellID at a given index within the notebook.
 *
 * @param notebook The notebook the cell will be inserted into.
 * @param cell The cell that will be inserted
 * @param cellID The ID of the cell.
 * @param index The position we would like to insert the cell at
 *
 * @returns The modified notebook.
 */
export function insertCellAt(
  notebook: ImmutableNotebook,
  cell: ImmutableCell,
  cellId: string,
  index: number
): ImmutableNotebook {
  return notebook.withMutations(nb =>
    nb
      .setIn(["cellMap", cellId], cell)
      .set("cellOrder", nb.get("cellOrder").insert(index, cellId))
  );
}

/**
 * Inserts a new cell with cellID before an existing cell with priorCellID
 * in the notebook.
 *
 * @param notebook The notebook the cell will be inserted into.
 * @param cell The cell that will be inserted
 * @param cellID The ID of the cell.
 * @param priorCellID The ID of the existing cell.
 */
export function insertCellAfter(
  notebook: ImmutableNotebook,
  cell: ImmutableCell,
  cellId: string,
  priorCellId: string
): ImmutableNotebook {
  return insertCellAt(
    notebook,
    cell,
    cellId,
    notebook.get("cellOrder").indexOf(priorCellId) + 1
  );
}

/**
 * Deprecated: Delete a cell with CellID at a given location.
 *
 * Note that this function is deprecated in favor of `deleteCell`.
 *
 * @param notebook The notebook containing the cell.
 * @param cellID The ID of the cell that will be deleted.
 *
 * @returns The modified notebook
 *
 * @deprecated use `deleteCell()` instead
 */
export function removeCell(
  notebook: ImmutableNotebook,
  cellId: string
): ImmutableNotebook {
  console.log(
    "Deprecation Warning: removeCell() is being deprecated. Please use deleteCell() instead"
  );

  return deleteCell(notebook, cellId);
}

/**
 * Delete a cell with CellID at a given location.
 *
 * @param notebook The notebook containing the cell.
 * @param cellID The ID of the cell that will be deleted.
 *
 * @returns The modified notebook
 */
export function deleteCell(
  notebook: ImmutableNotebook,
  cellId: string
): ImmutableNotebook {
  return notebook
    .removeIn(["cellMap", cellId])
    .update("cellOrder", cellOrder => cellOrder.filterNot(id => id === cellId));
}

/**
 * Mark a cell as deleting; can be undone.
 *
 * @param notebook The notebook containing the cell.
 * @param cellID The ID of the cell that will be deleted.
 *
 * @returns The modified notebook
 */
export function markCellDeleting(
  notebook: ImmutableNotebook,
  cellId: string
): ImmutableNotebook {
  return notebook.withMutations(nb =>
    nb.setIn(
      ["cellMap", cellId],
      nb
        .getIn(["cellMap", cellId])
        .setIn(["metadata", "nteract", "transient", "deleting"], true)
    )
  );
}

/**
 * Undo marking a cell as deleting.
 *
 * @param notebook The notebook containing the cell.
 * @param cellID The ID of the cell that will not be deleted.
 *
 * @returns The modified notebook
 */
export function markCellNotDeleting(
  notebook: ImmutableNotebook,
  cellId: string
): ImmutableNotebook {
  return notebook.withMutations(nb =>
    nb.setIn(
      ["cellMap", cellId],
      nb
        .getIn(["cellMap", cellId])
        .setIn(["metadata", "nteract", "transient", "deleting"], false)
    )
  );
}

/**
 * A new 'monocell' notebook with a single empty code cell. This function is useful
 * if you are looking to initialize a fresh, new notebook.
 */
export const monocellNotebook = appendCellToNotebook(
  emptyNotebook,
  emptyCodeCell
);
