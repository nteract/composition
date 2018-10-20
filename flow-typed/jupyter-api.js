// @flow
declare type JupyterApi$ContentError = {
  reason: string,
  message: string
};

declare type JupyterApi$DirectoryContent = {
  type: "directory",
  mimetype: null,
  content: null | Array<JupyterApi$Content>, // Technically content-free content ;)

  name: string,
  path: string,

  created: Date,
  last_modified: Date,
  writable: boolean,
  format: "json"
};

declare type JupyterApi$NotebookContent = {
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

declare type JupyterApi$FileContent = {
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

declare type JupyterApi$Content =
  | JupyterApi$DirectoryContent
  | JupyterApi$FileContent
  | JupyterApi$NotebookContent;
