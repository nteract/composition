// @flow
import * as Immutable from "immutable";
import { emptyNotebook } from "@nteract/commutable";
import type { CellID, ImmutableNotebook } from "@nteract/commutable";

import type { KernelRef } from "../..";

export type DocumentRecordProps = {
  type: "notebook",
  // TODO: This _needs_ to become a Record
  notebook: ImmutableNotebook,
  savedNotebook: ImmutableNotebook,
  transient: Immutable.Map<string, any>, // has the keypaths for updating displays
  // transient should be more fully typed (be a record itself)
  // right now it's keypaths and then it looks like it's able to handle any per
  // cell transient data that will be deleted when the kernel is restarted
  cellPagers: any,
  editorFocused: ?CellID,
  cellFocused: ?CellID,
  copied: Immutable.Map<any, any>,
  kernelRef: ?KernelRef
};
export const makeDocumentRecord: Immutable.RecordFactory<
  DocumentRecordProps
> = Immutable.Record({
  type: "notebook",
  notebook: emptyNotebook,
  savedNotebook: emptyNotebook,
  transient: Immutable.Map({
    keyPathsForDisplays: Immutable.Map()
  }),
  cellPagers: Immutable.Map(),
  editorFocused: null,
  cellFocused: null,
  copied: Immutable.Map(),
  kernelRef: null
});
export type NotebookModel = Immutable.RecordOf<DocumentRecordProps>;

export type NotebookContentRecordProps = {
  mimetype: ?string,
  created: ?Date,
  format: "json",
  lastSaved: ?Date,
  model: NotebookModel,
  filepath: string,
  type: "notebook",
  writable: boolean
};

export const makeNotebookContentRecord: Immutable.RecordFactory<
  NotebookContentRecordProps
> = Immutable.Record({
  mimetype: null,
  created: null,
  format: "json",
  lastSaved: null,
  model: makeDocumentRecord(),
  filepath: "",
  type: "notebook",
  writable: true
});

export type NotebookContentRecord = Immutable.RecordOf<
  NotebookContentRecordProps
>;
