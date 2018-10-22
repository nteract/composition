// @flow
import * as Immutable from "immutable";

import type { ContentRef } from "../../refs";

import type { NotebookContentRecord, NotebookModel } from "./notebook";
import type { DirectoryContentRecord, DirectoryModelRecord } from "./directory";
import type { DummyContentRecord, EmptyModelRecord } from "./dummy";
import type { FileContentRecord, FileModelRecord } from "./file";

export * from "./notebook";
export * from "./directory";
export * from "./dummy";
export * from "./file";

export type ContentModel =
  | NotebookModel
  | DirectoryModelRecord
  | FileModelRecord
  | EmptyModelRecord;

export type ContentRecord =
  | NotebookContentRecord
  | DummyContentRecord
  | FileContentRecord
  | DirectoryContentRecord;

export type ContentsRecordProps = {
  byRef: Immutable.Map<ContentRef, ContentRecord>
};

export const makeContentsRecord: Immutable.RecordFactory<
  ContentsRecordProps
> = Immutable.Record({
  byRef: Immutable.Map()
});
