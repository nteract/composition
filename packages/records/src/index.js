// @flow

export * from "./outputs";
export * from "./cells";
export * from "./common";
import * as outputs from "./outputs";

import type { Notebook as v4Notebook } from "./structures";

export type ExecutionCount = number | null;

export type MimeBundle = JSONObject;

export type CellType = "markdown" | "code";
export type CellID = string;

import type {
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  ImmutableOutput,
  ImmutableOutputs,
  ImmutableMimeBundle,
  ImmutableCellOrder,
  ImmutableCellMap
} from "./types";

export type {
  ImmutableCellOrder,
  ImmutableCellMap,
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  ImmutableOutput,
  ImmutableOutputs,
  ImmutableMimeBundle
};

const {
  emptyNotebook,
  emptyCodeCell,
  emptyMarkdownCell,
  appendCell,
  monocellNotebook,
  createCodeCell,
  appendCellToNotebook,
  insertCellAt,
  insertCellAfter,
  removeCell
} = require("./structures");

export type Notebook = v4Notebook;

function freezeReviver(k: string, v: JSONType): JSONType {
  return Object.freeze(v);
}

function parseNotebook(notebookString: string): Notebook {
  return JSON.parse(notebookString, freezeReviver);
}

// Expected usage is stringifyNotebook(toJS(immutableNotebook))
function stringifyNotebook(notebook: v4Notebook): string {
  return JSON.stringify(notebook, null, 2);
}

const createImmutableOutput = outputs.outputFromNbformat;

export {
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  monocellNotebook,
  createCodeCell,
  parseNotebook,
  stringifyNotebook,
  insertCellAt,
  insertCellAfter,
  removeCell,
  appendCell,
  appendCellToNotebook,
  createImmutableOutput
};
