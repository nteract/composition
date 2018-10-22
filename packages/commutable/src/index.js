/* @flow */

import * as Immutable from "immutable";

import type { Notebook as v4Notebook } from "./v4";
import type { Notebook as v3Notebook } from "./v3";
import type {
  ImmutableNotebook,
  ImmutableCodeCell,
  ImmutableMarkdownCell,
  ImmutableRawCell,
  ImmutableCell,
  ImmutableOutput,
  ImmutableOutputs,
  ImmutableMimeBundle,
  ImmutableJSONType,
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
  ImmutableMimeBundle,
  ImmutableJSONType
};

const v4 = require("./v4");
const v3 = require("./v3");
// Deprecation Warning: removeCell() is being deprecated. Please use deleteCell() instead
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
  removeCell,
  deleteCell
} = require("./structures");

export type ExecutionCount = number | null;
export type MimeBundle = JSONObject;
export type CellType = "markdown" | "code";
export type CellID = string;
export type Notebook = v4Notebook | v3Notebook;

function freezeReviver(k: string, v: JSONType): JSONType {
  return Object.freeze(v);
}

// Expected usage of below is
// fromJS(parseNotebook(string|buffer))

function parseNotebook(notebookString: string): Notebook {
  return JSON.parse(notebookString, freezeReviver);
}

function fromJS(notebook: Notebook | ImmutableNotebook): ImmutableNotebook {
  if (Immutable.Map.isMap(notebook)) {
    // $FlowFixMe: isMap doesn't hint to flow that this is an Immutable
    const immNotebook: ImmutableNotebook = notebook;
    if (immNotebook.has("cellOrder") && immNotebook.has("cellMap")) {
      return immNotebook;
    }
    throw new TypeError(
      `commutable was passed an Immutable.Map structure that is not a notebook`
    );
  }

  // $FlowFixMe: isMap doesn't hint to flow that this is a plain Object
  const notebookJSON: Notebook = notebook;

  if (notebookJSON.nbformat === 4 && notebookJSON.nbformat_minor >= 0) {
    if (
      Array.isArray(notebookJSON.cells) &&
      typeof notebookJSON.metadata === "object"
    ) {
      return v4.fromJS(notebookJSON);
    }
  } else if (notebookJSON.nbformat === 3 && notebookJSON.nbformat_minor >= 0) {
    return v3.fromJS(notebookJSON);
  }

  if (notebookJSON.nbformat) {
    throw new TypeError(
      `nbformat v${notebookJSON.nbformat}.${
        notebookJSON.nbformat_minor
      } not recognized`
    );
  }

  throw new TypeError("This notebook format is not supported");
}

function toJS(immnb: ImmutableNotebook): v4Notebook {
  const minorVersion: null | number = immnb.get("nbformat_minor", null);

  if (
    immnb.get("nbformat") === 4 &&
    typeof minorVersion === "number" &&
    minorVersion >= 0
  ) {
    return v4.toJS(immnb);
  }
  throw new TypeError("Only notebook formats 3 and 4 are supported!");
}

// Expected usage is stringifyNotebook(toJS(immutableNotebook))
function stringifyNotebook(notebook: v4Notebook): string {
  return JSON.stringify(notebook, null, 2);
}

const createImmutableOutput = v4.createImmutableOutput;
const createImmutableMimeBundle = v4.createImmutableMimeBundle;

// Deprecation Warning: removeCell() is being deprecated. Please use deleteCell() instead
export {
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  monocellNotebook,
  toJS,
  fromJS,
  createCodeCell,
  parseNotebook,
  stringifyNotebook,
  insertCellAt,
  insertCellAfter,
  removeCell,
  deleteCell,
  appendCell,
  appendCellToNotebook,
  createImmutableOutput,
  createImmutableMimeBundle
};
