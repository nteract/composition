/* @flow */
import * as v4 from './v4';

import type { Notebook as v4Notebook } from './v4';

import {
  emptyNotebook,
  emptyCodeCell,
  emptyMarkdownCell,
  appendCell,
  monocellNotebook,
} from './structures';

import type {
  ImmutableNotebook,
  JSONType,
} from './types';

type PlaceholderNotebook = {
  nbformat: number,
  nbformat_minor: number,
};

export type Notebook = PlaceholderNotebook & v4Notebook;

function freezeReviver(k: string, v: JSONType): JSONType {
  return Object.freeze(v);
}

// Expected usage of below is
// fromJS(parseNotebook(string|buffer))

export function parseNotebook(notebookString: string): Notebook {
  return JSON.parse(notebookString, freezeReviver);
}

export function fromJS(notebookJSON: Notebook): ImmutableNotebook {
  if (notebookJSON.nbformat === 4 && notebookJSON.nbformat_minor >= 0) {
    if (Array.isArray(notebookJSON.cells) && typeof notebookJSON.metadata === 'object') {
      return v4.fromJS(notebookJSON);
    }
  }

  if (notebookJSON.nbformat) {
    throw new TypeError(
      `nbformat v${notebookJSON.nbformat}.${notebookJSON.nbformat_minor} not recognized`
    );
  }

  throw new TypeError('This notebook format is not supported');
}

export function toJS(immnb: ImmutableNotebook): v4Notebook {
  if (immnb.get('nbformat') === 4 && immnb.get('nbformat_minor') >= 0) {
    return v4.toJS(immnb);
  }
  throw new TypeError('Only notebook format 4 is supported');
}

// Expected usage is stringifyNotebook(toJS(immutableNotebook))
export function stringifyNotebook(notebook: v4Notebook): string {
  return JSON.stringify(notebook, null, 2);
}

export type {
  ImmutableNotebook,
};

export {
  emptyCodeCell,
  emptyMarkdownCell,
  emptyNotebook,
  appendCell,
  monocellNotebook,
};
