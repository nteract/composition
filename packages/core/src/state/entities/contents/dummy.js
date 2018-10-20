// @flow

import * as Immutable from "immutable";

export type EmptyModelRecordProps = {
  type: "unknown"
};

export const makeEmptyModel: Immutable.RecordFactory<
  EmptyModelRecordProps
> = Immutable.Record({
  type: "unknown"
});
export type EmptyModelRecord = Immutable.RecordOf<EmptyModelRecordProps>;

export type DummyContentRecordProps = {
  type: "dummy",
  assumedType: NotebookTypes,
  mimetype: ?string,
  lastSaved: null,
  filepath: string,
  model: EmptyModelRecord
};
export const makeDummyContentRecord: Immutable.RecordFactory<
  DummyContentRecordProps
> = Immutable.Record({
  type: "dummy",
  mimetype: null,
  assumedType: "unknown",
  lastSaved: null,
  filepath: "",
  model: makeEmptyModel()
});
export type DummyContentRecord = Immutable.RecordOf<DummyContentRecordProps>;
