// @flow

import * as Immutable from "immutable";

import type { KernelRef } from "../../refs";

export type FileModelRecordProps = {
  type: "file",
  text: string,
  // I'll assume we only allocate a kernel for certain file types
  kernelRef: ?KernelRef,
  // TODO: Does this really belong here?
  outputs: Immutable.List<any>
};
export const makeFileModelRecord: Immutable.RecordFactory<
  FileModelRecordProps
> = Immutable.Record({
  type: "file",
  text: "",
  kernelRef: null,
  outputs: Immutable.List()
});
export type FileModelRecord = Immutable.RecordOf<FileModelRecordProps>;

export type FileContentRecordProps = {
  type: "file",
  mimetype: ?string,
  created: ?Date,
  format: "json",
  lastSaved: null,
  filepath: string,
  model: FileModelRecord
};
export const makeFileContentRecord: Immutable.RecordFactory<
  FileContentRecordProps
> = Immutable.Record({
  type: "file",
  mimetype: null,
  created: null,
  format: "json",
  lastSaved: null,
  filepath: "",
  model: makeFileModelRecord()
});

export type FileContentRecord = Immutable.RecordOf<FileContentRecordProps>;
