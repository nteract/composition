// @flow
import type { ContentRef } from "../refs";
import type { ImmutableNotebook } from "@nteract/commutable";
import type { RecordFactory, RecordOf } from "immutable";
import { List, Map, Record } from "immutable";

// TODO: NotebookModel will likely diverge from this when we flatten
// inputs/outputs. For now, this is nicely defined and is workable.
type NotebookModel = ImmutableNotebook;
type DirectoryModel = List<ContentRef>;
type FileModel = string;

type BaseContentRecordProps = {
  path: ?string,
  name: ?string,
  created: ?Date,
  latSaved: ?Date,
  writable: boolean
};

export type FileContentRecordProps = BaseContentRecordProps & {
  type: "file",
  mimetype: string,
  format: "text" | "base64",
  model: string
};

export const makeFileContentRecord: RecordFactory<
  FileContentRecordProps
> = Record({
  // Base properties.
  path: null,
  name: null,
  created: null,
  latSaved: null,
  writable: false,

  // File properties.
  type: "file",
  mimetype: "text",
  format: "text",
  model: ""
});

export type DirectoryContentRecordProps = BaseContentRecordProps & {
  type: "directory",
  format: null | "json",
  model: List<ContentRef>
};

export type NotebookContentRecordProps = BaseContentRecordProps & {
  type: "notebook",
  format: null | "json",
  model: *
};

export type ContentRecordProps = {
  type: "directory" | "notebook" | "file",
  mimetype: ?string,
  path: string,
  name: ?string,
  created: ?Date,
  lastSaved: ?Date,
  writable: boolean,
  format: null | "json" | "text" | "base64",
  model: null | NotebookModel | DirectoryModel | FileModel
};

export const makeContentRecord: RecordFactory<ContentRecordProps> = Record({
  type: "directory",
  mimetype: null,
  path: ".",
  name: null,
  created: null,
  lastSaved: null,
  writable: false,
  format: null,
  model: null
});

export type ContentsRecordProps = {
  byRef: Map<ContentRef, RecordOf<ContentRecordProps>>
};

export const makeContentsRecord: RecordFactory<ContentsRecordProps> = Record({
  byRef: Map()
});
