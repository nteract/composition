// @flow

import * as Immutable from "immutable";

export type FileModelRecordProps = {
  type: "file",
  text: string
};
export const makeFileModelRecord: Immutable.RecordFactory<
  FileModelRecordProps
> = Immutable.Record({
  type: "file",
  text: ""
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
