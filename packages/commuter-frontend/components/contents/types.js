// @flow

export type ContentError = {
  reason: string,
  message: string
};

export type DirectoryContent = {
  type: "directory",
  mimetype: null,
  content: null | Array<Content>, // Technically content-free content ;)

  name: string,
  path: string,

  created: Date,
  last_modified: Date,
  writable: boolean,
  format: "json"
};

export type NotebookContent = {
  type: "notebook",
  mimetype: null,
  content: null | Object,

  name: string,
  path: string,

  created: Date,
  last_modified: Date,
  writable: boolean,
  format: "json"
};

export type FileContent = {
  type: "file",
  mimetype: null | string,
  content: null | string,

  name: string,
  path: string,

  created: Date,
  last_modified: Date,
  writable: boolean,
  format: null | "text" | "base64"
};

export type Content = DirectoryContent | FileContent | NotebookContent;
