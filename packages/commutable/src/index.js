/* @flow */

import type { Notebook as v4Notebook } from "./v4";
import type { Notebook as v3Notebook } from "./v3";

import type { ImmutableNotebook, JSONType } from "./types";

import * as Immutable from "immutable";

type PlaceholderNotebook = {
  nbformat: number,
  nbformat_minor: number
};

const v4 = require("./v4");
const v3 = require("./v3");

const {
  emptyNotebook,
  emptyCodeCell,
  emptyMarkdownCell,
  appendCell,
  monocellNotebook,

  appendCellToNotebook,

  insertCellAt,
  insertCellAfter,
  removeCell
} = require("./structures");

export type Notebook = PlaceholderNotebook & v4Notebook & v3Notebook;

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
    // $FlowFixMe: Immutable
    const immNotebook: ImmutableNotebook = notebook;
    if (immNotebook.has("cellOrder") && immNotebook.has("cellMap")) {
      return immNotebook;
    }
    throw new TypeError(
      `commutable was passed an Immutable.Map structure that is not a notebook`
    );
  }

  // $FlowFixMe: Immutable
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
  if (immnb.get("nbformat") === 4 && immnb.get("nbformat_minor") >= 0) {
    return v4.toJS(immnb);
  }
  throw new TypeError("Only notebook formats 3 and 4 are supported!");
}

// Expected usage is stringifyNotebook(toJS(immutableNotebook))
function stringifyNotebook(notebook: v4Notebook): string {
  return JSON.stringify(notebook, null, 2);
}

module.exports = {
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  monocellNotebook,
  toJS,
  fromJS,

  parseNotebook,
  stringifyNotebook,

  insertCellAt,
  insertCellAfter,
  removeCell,
  appendCell,
  appendCellToNotebook,
  createImmutableOutput: v4.createImmutableOutput
};

export type { ImmutableNotebook };
