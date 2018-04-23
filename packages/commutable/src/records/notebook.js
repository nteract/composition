// @flow

import * as Immutable from "immutable";
import type { Metadata } from "./base";
import type { CellRef } from "./refs";

export type NotebookProps = {
  nbformat: string,
  nbformatMinor: string,
  // TODO: Some of the metadata should be tightly specced
  //       Others can end up in the generic map
  metadata: Metadata,
  // ordered list of cells
  cells: Immutable.List<CellRef>
  // unlike the ol' commutable, we only keep the ordered list
  // of cells here and assume the cellMap, which we'll have in
  // a byRef structure, is on core.entities.cells.byRef
};

export type NotebookRecord = Immutable.RecordOf<NotebookProps>;
// Enforce all properties being set by having a wrapper function that
// takes NotebookProps
const notebookMaker: Immutable.RecordFactory<NotebookProps> = Immutable.Record({
  nbformat: "4",
  nbformatMinor: "4",
  metadata: Immutable.Map(),
  cells: Immutable.List()
});
export function makeNotebook(notebook: NotebookProps): NotebookRecord {
  return notebookMaker(notebook);
}
