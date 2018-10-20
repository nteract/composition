// @flow

import * as Immutable from "immutable";

import type { ContentRef } from "../../refs";

export type DirectoryModelRecordProps = {
  type: "directory",
  // TODO: when we want the directory "app" to show how they're sorted,
  //       reflect that with a property like "sortedBy". For example:
  //
  //         sortedBy: "created" | "lastSaved" | "type" | "name"
  //
  //       could also group them by type, etc.
  //
  //         groupedBy: "type" | "mimetype"
  //
  items: Immutable.List<ContentRef>
};
export const makeDirectoryModel: Immutable.RecordFactory<
  DirectoryModelRecordProps
> = Immutable.Record({
  type: "directory",
  items: Immutable.List()
});
export type DirectoryModelRecord = Immutable.RecordOf<
  DirectoryModelRecordProps
>;

export type DirectoryContentRecordProps = {
  mimetype: null,
  type: "directory",
  created: ?Date,
  format: "json",
  lastSaved: null,
  filepath: string,
  model: DirectoryModelRecord
};
export const makeDirectoryContentRecord: Immutable.RecordFactory<
  DirectoryContentRecordProps
> = Immutable.Record({
  mimetype: null,
  type: "directory",
  created: null,
  format: "json",
  lastSaved: null,
  filepath: "",
  model: makeDirectoryModel()
});
export type DirectoryContentRecord = Immutable.RecordOf<
  DirectoryContentRecordProps
>;
